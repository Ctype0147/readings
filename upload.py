import argparse
import logging
import math
import os
import sys
from pathlib import Path

import serial
from dotenv import load_dotenv
from supabase import create_client

BAUD_RATE = 9600
DEFAULT_SERIAL_PORT = "/dev/cu.usbmodem101"
ROOT = Path(__file__).resolve().parent

logger = logging.getLogger("upload")


def load_supabase_credentials() -> tuple[str, str]:
    env_file = ROOT / ".env"
    if not env_file.is_file():
        env_file = ROOT / "readings.env"
    load_dotenv(env_file)

    url = os.getenv("VITE_SUPABASE_URL")
    key = os.getenv("VITE_SUPABASE_ANON_KEY")
    if not url or not key:
        raise RuntimeError(
            "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env "
            "or the process environment."
        )
    return url, key


def parse_reading(line: bytes) -> float | None:
    text = line.decode("utf-8", errors="replace").strip()
    if not text:
        return None

    try:
        value = float(text)
    except ValueError:
        logger.warning("Skipping non-numeric serial line: %r", text)
        return None

    if not math.isfinite(value):
        logger.warning("Skipping non-finite serial value: %r", text)
        return None
    return value


def main() -> int:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
    )
    try:
        url, key = load_supabase_credentials()
    except RuntimeError as error:
        logger.error("%s", error)
        return 1

    parser = argparse.ArgumentParser(
        description="Read numeric lines from Arduino serial and insert them into Supabase."
    )
    parser.add_argument(
        "--port",
        default=os.getenv("SERIAL_PORT", DEFAULT_SERIAL_PORT),
        help=f"serial device path (default: %(default)s)",
    )
    args = parser.parse_args()

    client = create_client(url, key)
    logger.info("Connecting to serial port %s at %d baud", args.port, BAUD_RATE)

    try:
        with serial.Serial(args.port, BAUD_RATE, timeout=None) as port:
            logger.info("Connected. Waiting for newline-delimited readings.")
            while True:
                line = port.readline()
                value = parse_reading(line)
                if value is None:
                    continue
                client.table("readings").insert({"value": value}).execute()
                logger.info("Uploaded reading: %s", value)
    except KeyboardInterrupt:
        logger.info("Stopped.")
        return 0
    except serial.SerialException as error:
        logger.error("Serial port error: %s", error)
        return 1
    except OSError as error:
        logger.error("I/O error: %s", error)
        return 1


if __name__ == "__main__":
    sys.exit(main())
