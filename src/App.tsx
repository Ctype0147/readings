import { useEffect, useMemo, useState } from "react"
import { supabase, supabaseConfigError } from "./supabase"

type IconProps = {
  className?: string
}

interface Reading {
  key: string
  timestamp: number
  time: string
  value: number
}

interface TrendChartProps {
  data: Reading[]
  label: string
}

function TiltIcon({ className = "size-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 19 19 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect
        x="7.2"
        y="7.2"
        width="9.6"
        height="9.6"
        rx="2.2"
        transform="rotate(-45 7.2 7.2)"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5 14v5h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ActivityIcon({ className = "size-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 12h4l2.2-6.5 4.1 13 2.3-6.5H21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MoreIcon({ className = "size-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  )
}

function TrendChart({ data, label }: TrendChartProps) {
  const width = 900
  const height = 300
  const padding = { left: 42, right: 20, top: 20, bottom: 40 }
  const yMin = Math.min(
    0,
    Math.floor(Math.min(...data.map(({ value }) => value)) / 2) * 2,
  )
  const yMax = Math.max(
    6,
    Math.ceil(Math.max(...data.map(({ value }) => value)) / 2) * 2,
  )
  const yRange = yMax - yMin
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom
  const points = data.map((item, index) => ({
    ...item,
    x:
      padding.left +
      (data.length === 1 ? 0.5 : index / (data.length - 1)) * plotWidth,
    y: padding.top + plotHeight - ((item.value - yMin) / yRange) * plotHeight,
  }))
  const line = points.map((point) => `${point.x},${point.y}`).join(" ")
  const labelIndexes = Array.from(
    { length: Math.min(5, data.length) },
    (_, index) =>
      Math.round(
        (index * (data.length - 1)) / (Math.min(5, data.length) - 1 || 1),
      ),
  )

  return (
    <div className="chart-scroll" aria-label={`${label} 기울기 변화 선 그래프`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        className="chart"
        preserveAspectRatio="none"
      >
        <title>{`${label} 기울기 변화: ${data[0].value}도에서 ${data.at(-1)?.value}도로 변화`}</title>
        {Array.from(
          { length: 4 },
          (_, index) => yMin + (index * yRange) / 3,
        ).map((tick) => {
          const y =
            padding.top + plotHeight - ((tick - yMin) / yRange) * plotHeight
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                className="grid-line"
              />
              <text
                x={padding.left - 12}
                y={y + 4}
                textAnchor="end"
                className="axis-label"
              >
                {tick.toFixed(tick % 1 ? 1 : 0)}°
              </text>
            </g>
          )
        })}
        {labelIndexes.map((index) => (
          <text
            key={index}
            x={points[index].x}
            y={height - 10}
            textAnchor={
              index === 0
                ? "start"
                : index === data.length - 1
                  ? "end"
                  : "middle"
            }
            className="axis-label"
          >
            {data[index].time}
          </text>
        ))}
        <polyline points={line} className="trend-line trend-line-shadow" />
        <polyline points={line} className="trend-line" />
        {points.map((point, index) => (
          <g key={`${point.time}-${index}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r={index === points.length - 1 ? 7 : 4}
              className="data-point-halo"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r={index === points.length - 1 ? 4 : 2.5}
              className="data-point"
            >
              <title>{`${point.time} · ${point.value}°`}</title>
            </circle>
          </g>
        ))}
      </svg>
    </div>
  )
}

function parseReading(row: unknown): Reading | null {
  if (typeof row !== "object" || row === null) return null

  const record = row as Record<string, unknown>
  const value =
    typeof record.value === "number"
      ? record.value
      : typeof record.value === "string" && record.value.trim()
        ? Number(record.value)
        : Number.NaN
  const createdAt =
    typeof record.created_at === "string" ? record.created_at : ""
  const timestamp = Date.parse(createdAt)
  if (!Number.isFinite(value) || !Number.isFinite(timestamp)) return null

  return {
    key: `${createdAt}:${value}`,
    timestamp,
    time: new Date(timestamp).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
    value,
  }
}

function mergeReadings(...groups: Reading[][]): Reading[] {
  const unique = new Map<string, Reading>()
  for (const reading of groups.flat()) unique.set(reading.key, reading)
  return [...unique.values()]
    .sort((left, right) => left.timestamp - right.timestamp)
    .slice(-100)
}

export default function App() {
  const [readings, setReadings] = useState<Reading[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [realtimeStatus, setRealtimeStatus] =
    useState<"connecting" | "connected" | "disconnected">("connecting")
  const [errorMessage, setErrorMessage] = useState("")
  const latestReading = readings.at(-1)
  const previousReading = readings.at(-2)
  const currentChange =
    latestReading && previousReading
      ? latestReading.value - previousReading.value
      : null
  const stats = useMemo(() => {
    const values = readings.map(({ value }) => value)
    if (!values.length) return null
    return {
      average: (
        values.reduce((sum, value) => sum + value, 0) / values.length
      ).toFixed(1),
      minimum: Math.min(...values).toFixed(1),
      maximum: Math.max(...values).toFixed(1),
    }
  }, [readings])

  useEffect(() => {
    const client = supabase
    if (!client) {
      setRealtimeStatus("disconnected")
      setErrorMessage(supabaseConfigError)
      setIsLoading(false)
      return
    }

    let active = true
    let initialLoadComplete = false
    let pendingRealtimeReadings: Reading[] = []

    const channel = client
      .channel("dashboard-readings")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "readings" },
        (payload) => {
          const reading = parseReading(payload.new)
          if (!reading) {
            if (active) {
              setErrorMessage(
                "readings 행의 value 또는 created_at 값이 올바르지 않습니다.",
              )
            }
            return
          }
          if (!initialLoadComplete) {
            pendingRealtimeReadings.push(reading)
            return
          }
          if (active)
            setReadings((current) => mergeReadings(current, [reading]))
        },
      )
      .subscribe((status, error) => {
        if (!active) return
        if (status === "SUBSCRIBED") {
          setRealtimeStatus("connected")
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          setRealtimeStatus("disconnected")
          setErrorMessage(
            `Supabase Realtime 연결 오류: ${error?.message ?? status}`,
          )
        }
      })

    async function loadLatestReadings(client: NonNullable<typeof supabase>) {
      const { data, error } = await client
        .from("readings")
        .select("value, created_at")
        .order("created_at", { ascending: false })
        .limit(100)

      if (!active) return
      if (error) {
        setErrorMessage(`최신 측정값 조회 실패: ${error.message}`)
      } else {
        const rows = (data ?? [])
          .map(parseReading)
          .filter((reading): reading is Reading => reading !== null)
        setReadings(mergeReadings(rows, pendingRealtimeReadings))
        if (rows.length !== (data?.length ?? 0)) {
          setErrorMessage(
            "일부 readings 행의 value 또는 created_at 값을 읽을 수 없습니다.",
          )
        }
      }
      initialLoadComplete = true
      pendingRealtimeReadings = []
      setIsLoading(false)
    }

    void loadLatestReadings(client)
    return () => {
      active = false
      void client.removeChannel(channel)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#17201c]">
      <header className="border-b border-[#dde3df] bg-white">
        <div className="mx-auto flex h-18 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a
            href="#"
            className="flex items-center gap-3"
            aria-label="Tilt Monitor 홈"
          >
            <span className="flex size-9 items-center justify-center rounded-[10px] bg-[#173f35] text-white shadow-[0_4px_12px_rgba(23,63,53,.18)]">
              <TiltIcon className="size-[21px]" />
            </span>
            <span className="text-[15px] font-bold tracking-[-0.01em] text-[#17312a]">
              TILT MONITOR
            </span>
          </a>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-[#738079]">
              {realtimeStatus === "connected"
                ? "Realtime 연결됨"
                : realtimeStatus === "connecting"
                  ? "Realtime 연결 중"
                  : "Realtime 연결 끊김"}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <section className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[12px] font-bold tracking-[0.12em] text-[#337562]">
              SENSOR 01
            </p>
            <h1 className="text-[28px] font-bold tracking-[-0.04em] text-[#17251f] sm:text-[34px]">
              기울기 센서 대시보드
            </h1>
            <p className="mt-2 text-[14px] text-[#6b7771] sm:text-[15px]">
              설비의 현재 기울기와 시간대별 변화를 모니터링합니다.
            </p>
          </div>
          <div
            className={`flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-semibold ${
              realtimeStatus === "connected"
                ? "border-[#cfe0d8] bg-[#edf7f2] text-[#28634f]"
                : "border-[#e1e6e3] bg-white text-[#738079]"
            }`}
          >
            <span
              className={`size-2 rounded-full ${
                realtimeStatus === "connected"
                  ? "animate-pulse bg-[#36a879]"
                  : "bg-[#93a19a]"
              }`}
            />
            {realtimeStatus === "connected"
              ? "실시간 수신 중"
              : realtimeStatus === "connecting"
                ? "Supabase 연결 중"
                : "Supabase 연결 확인 필요"}
          </div>
        </section>

        {errorMessage && (
          <p
            role="alert"
            className="mb-5 rounded-lg border border-[#f0c9c4] bg-[#fff4f2] px-4 py-3 text-[13px] text-[#a33d32]"
          >
            {errorMessage}
          </p>
        )}

        <div className="grid gap-5 lg:grid-cols-[minmax(290px,0.78fr)_minmax(0,2.22fr)]">
          <section className="sensor-card relative overflow-hidden rounded-2xl bg-[#173f35] p-6 text-white shadow-[0_16px_40px_rgba(23,63,53,.16)] sm:p-7 lg:min-h-[430px]">
            <div className="relative z-10 flex h-full flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] font-medium text-[#b8d3c9]">
                    현재 기울기
                  </p>
                  <p className="mt-1 text-[12px] text-[#83aa9c]">X축 기준</p>
                </div>
                <span className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/8 text-[#b9dacd]">
                  <TiltIcon className="size-5" />
                </span>
              </div>

              <div className="my-auto py-12 lg:py-8">
                <div className="flex items-start">
                  <strong className="sensor-value text-[84px] font-semibold leading-none tracking-[-0.07em] sm:text-[96px]">
                    {latestReading ? latestReading.value.toFixed(1) : "—"}
                  </strong>
                  {latestReading && (
                    <span className="ml-2 mt-2 text-[30px] font-light text-[#a8c9bd]">
                      °
                    </span>
                  )}
                </div>
                <div className="mt-5 flex items-center gap-2 text-[13px]">
                  {currentChange === null ? (
                    <span className="text-[#9ebeb2]">
                      {isLoading
                        ? "최신 데이터 불러오는 중"
                        : latestReading
                          ? "첫 측정값"
                          : "측정 데이터 없음"}
                    </span>
                  ) : (
                    <>
                      <span className="rounded-md bg-[#2f6b5a] px-2 py-1 font-semibold text-[#d9eee7]">
                        {currentChange >= 0 ? "+" : ""}
                        {currentChange.toFixed(1)}°
                      </span>
                      <span className="text-[#9ebeb2]">직전 측정 대비</span>
                    </>
                  )}
                </div>
              </div>

              <div className="border-t border-white/10 pt-5">
                <div className="mb-3 flex items-center justify-between text-[12px]">
                  <span className="text-[#9fbbb1]">안전 범위</span>
                  <span className="font-medium text-[#d6e7e1]">± 8.0°</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-black/20">
                  <div
                    className="h-full rounded-full bg-[#7fd1b2]"
                    style={{
                      width: `${Math.min(100, (Math.abs(latestReading?.value ?? 0) / 8) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#e0e5e2] bg-white p-5 shadow-[0_8px_30px_rgba(28,43,36,.05)] sm:p-7">
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[#397563]">
                    <ActivityIcon />
                  </span>
                  <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#1c2a24]">
                    기울기 변화
                  </h2>
                </div>
                <p className="mt-2 text-[13px] text-[#7a857f]">
                  최근 {readings.length}개 측정값 · 최대 100개
                </p>
              </div>
            </div>

            {readings.length ? (
              <TrendChart data={readings} label="최근 측정값" />
            ) : (
              <div className="flex h-[270px] items-center justify-center text-[13px] text-[#8a948f]">
                {isLoading
                  ? "측정값을 불러오는 중입니다."
                  : "표시할 측정값이 없습니다."}
              </div>
            )}

            <div className="mt-4 grid grid-cols-3 divide-x divide-[#e7ebe8] border-t border-[#edf0ee] pt-5">
              <div className="pr-3">
                <p className="text-[11px] text-[#8a948f]">평균</p>
                <p className="mt-1 text-[16px] font-bold text-[#2a3731]">
                  {stats ? `${stats.average}°` : "—"}
                </p>
              </div>
              <div className="px-4">
                <p className="text-[11px] text-[#8a948f]">최저</p>
                <p className="mt-1 text-[16px] font-bold text-[#2a3731]">
                  {stats ? `${stats.minimum}°` : "—"}
                </p>
              </div>
              <div className="pl-4">
                <p className="text-[11px] text-[#8a948f]">최고</p>
                <p className="mt-1 text-[16px] font-bold text-[#2a3731]">
                  {stats ? `${stats.maximum}°` : "—"}
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: "Supabase Realtime",
              value:
                realtimeStatus === "connected"
                  ? "연결됨"
                  : realtimeStatus === "connecting"
                    ? "연결 중"
                    : "연결 끊김",
              meta: "readings 테이블 새 행 구독",
              accent: realtimeStatus === "connected",
            },
            {
              label: "표시 데이터",
              value: `${readings.length}개`,
              meta: "최신 100개 측정값",
            },
            {
              label: "마지막 측정",
              value: latestReading?.time ?? "—",
              meta: "readings 테이블 최신 행",
            },
          ].map((item) => (
            <article
              key={item.label}
              className="flex items-center justify-between rounded-xl border border-[#e1e6e3] bg-white px-5 py-4 shadow-[0_4px_16px_rgba(27,43,35,.035)]"
            >
              <div>
                <p className="text-[11px] font-medium text-[#89938e]">
                  {item.label}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  {item.accent && (
                    <span className="size-2 rounded-full bg-[#36a879]" />
                  )}
                  <p className="text-[15px] font-bold text-[#26342e]">
                    {item.value}
                  </p>
                </div>
                <p className="mt-1 text-[11px] text-[#9aa29e]">{item.meta}</p>
              </div>
              <button
                type="button"
                aria-label={`${item.label} 상세 메뉴`}
                className="flex size-8 items-center justify-center rounded-lg text-[#98a29d] transition hover:bg-[#f2f5f3] hover:text-[#536159] focus:outline-none focus:ring-2 focus:ring-[#2b7561]/25"
              >
                <MoreIcon />
              </button>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
