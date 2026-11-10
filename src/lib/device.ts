import type { RealtimeChannel } from "@supabase/supabase-js"
import { DEVICE_ID, MAX_POINTS, SENSOR_MAX, SENSOR_MIN } from "../product"
import { db, IS_DEMO_MODE } from "./supabase"

export type Reading = { value: number; created_at: string }
export type Status = "disconnected" | "connecting" | "connected" | "error"

type ConnectOptions = {
  onInit: (rows: Reading[]) => void
  onReading: (row: Reading) => void
  onStatus: (status: Status) => void
}

let channel: RealtimeChannel | null = null
let demoTimer: ReturnType<typeof setInterval> | null = null
let demoStep = 0
let demoPower = false

function makeDemoReading(step: number): Reading {
  const middle = (SENSOR_MAX + SENSOR_MIN) / 2
  const amplitude = (SENSOR_MAX - SENSOR_MIN) * 0.38
  const value = Math.round(middle + Math.sin(step / 8) * amplitude)

  return {
    value,
    created_at: new Date().toISOString(),
  }
}

export async function connectSensor(opts: ConnectOptions): Promise<void> {
  await disconnectSensor()
  opts.onStatus("connecting")

  if (IS_DEMO_MODE || !db) {
    const initialRows = Array.from({ length: 24 }, (_, index) =>
      makeDemoReading(demoStep - 23 + index),
    )
    opts.onInit(initialRows)
    opts.onStatus("connected")

    demoTimer = setInterval(() => {
      demoStep += 1
      opts.onReading(makeDemoReading(demoStep))
    }, 500)
    return
  }

  const { data, error } = await db
    .from("sensor_readings")
    .select("value, created_at")
    .eq("device_id", DEVICE_ID)
    .order("created_at", { ascending: false })
    .limit(MAX_POINTS)

  if (error) {
    opts.onStatus("error")
    return
  }

  opts.onInit([...data as Reading[]].reverse())

  channel = db
    .channel(`sensor-readings-${DEVICE_ID}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "sensor_readings",
        filter: `device_id=eq.${DEVICE_ID}`,
      },
      (payload) => {
        const row = payload.new as Reading & { device_id: string }
        opts.onReading({ value: row.value, created_at: row.created_at })
      },
    )
    .subscribe((subscriptionStatus) => {
      if (subscriptionStatus === "SUBSCRIBED") opts.onStatus("connected")
      if (
        subscriptionStatus === "CHANNEL_ERROR" ||
        subscriptionStatus === "TIMED_OUT"
      ) {
        opts.onStatus("error")
      }
    })
}

export async function disconnectSensor(): Promise<void> {
  if (demoTimer) {
    clearInterval(demoTimer)
    demoTimer = null
  }

  if (channel && db) {
    await db.removeChannel(channel)
    channel = null
  }
}

export async function setLedPower(on: boolean): Promise<boolean> {
  if (IS_DEMO_MODE || !db) {
    demoPower = on
    return true
  }

  const { error } = await db
    .from("device_state")
    .upsert(
      {
        device_id: DEVICE_ID,
        led_on: on,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "device_id" },
    )

  return !error
}

export async function loadPower(): Promise<boolean> {
  if (IS_DEMO_MODE || !db) return demoPower

  const { data, error } = await db
    .from("device_state")
    .select("led_on")
    .eq("device_id", DEVICE_ID)
    .maybeSingle()

  if (error || !data) return false
  return Boolean(data.led_on)
}
