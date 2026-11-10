import type { CSSProperties } from "react"
import { SENSOR_MAX, SENSOR_MIN } from "../product"

type SensorMoonProps = {
  value?: number
  power: boolean
}

export default function SensorMoon({ value, power }: SensorMoonProps) {
  const normalizedValue =
    value === undefined ? 0 : (value - SENSOR_MIN) / (SENSOR_MAX - SENSOR_MIN)
  const level = Math.min(1, Math.max(0, normalizedValue))
  const brightness = Math.round(level * 100)
  const moonStyle = { "--level": level } as CSSProperties

  return (
    <section className="moon-stage" aria-label="달 상태">
      <div>
        <div
          className="moon"
          data-power={power ? "on" : "off"}
          style={moonStyle}
          role="img"
          aria-label={power ? `달 밝기 ${brightness}%` : "달 꺼짐"}
        >
          <img src="/images/moon.webp" alt="" />
        </div>
        <p className="t-value sensor-reading">
          {value === undefined ? "—" : value.toLocaleString("ko-KR")}
        </p>
      </div>
    </section>
  )
}
