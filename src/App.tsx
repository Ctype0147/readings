import { useMemo, useState } from "react"

type IconProps = {
  className?: string
}

const ranges = ["30분", "2시간", "24시간"] as const
type Range = typeof ranges[number]

const chartDatasets: Record<Range, { time: string value: number }[]> = {
  "30분": [
    { time: "10:30", value: 3.7 },
    { time: "10:33", value: 3.8 },
    { time: "10:35", value: 3.6 },
    { time: "10:38", value: 3.9 },
    { time: "10:40", value: 4.1 },
    { time: "10:43", value: 4.0 },
    { time: "10:45", value: 3.9 },
    { time: "10:48", value: 3.7 },
    { time: "10:50", value: 3.6 },
    { time: "10:53", value: 3.7 },
    { time: "10:55", value: 3.9 },
    { time: "10:58", value: 3.8 },
    { time: "11:00", value: 3.8 },
  ],
  "2시간": [
    { time: "09:00", value: 1.2 },
    { time: "09:10", value: 1.8 },
    { time: "09:20", value: 1.5 },
    { time: "09:30", value: 2.6 },
    { time: "09:40", value: 2.2 },
    { time: "09:50", value: 3.1 },
    { time: "10:00", value: 2.8 },
    { time: "10:10", value: 3.9 },
    { time: "10:20", value: 4.4 },
    { time: "10:30", value: 3.7 },
    { time: "10:40", value: 4.1 },
    { time: "10:50", value: 3.6 },
    { time: "11:00", value: 3.8 },
  ],
  "24시간": [
    { time: "11:00", value: 2.1 },
    { time: "13:00", value: 2.4 },
    { time: "15:00", value: 2.0 },
    { time: "17:00", value: 2.7 },
    { time: "19:00", value: 3.2 },
    { time: "21:00", value: 2.9 },
    { time: "23:00", value: 3.4 },
    { time: "01:00", value: 3.0 },
    { time: "03:00", value: 3.5 },
    { time: "05:00", value: 4.2 },
    { time: "07:00", value: 4.0 },
    { time: "09:00", value: 3.6 },
    { time: "11:00", value: 3.8 },
  ],
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

function PauseIcon({ className = "size-4" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="6.5" y="5" width="3.5" height="14" rx="1" />
      <rect x="14" y="5" width="3.5" height="14" rx="1" />
    </svg>
  )
}

function PlayIcon({ className = "size-4" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M7.5 5.6a1.2 1.2 0 0 1 1.85-1L18 11a1.2 1.2 0 0 1 0 2l-8.65 6.4a1.2 1.2 0 0 1-1.85-1V5.6Z" />
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

function TrendChart({
  data,
  range,
}: {
  data: typeof chartDatasets[Range]
  range: Range
}) {
  const width = 900
  const height = 300
  const padding = { left: 42, right: 20, top: 20, bottom: 40 }
  const yMax = 6
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom
  const points = data.map((item, index) => ({
    ...item,
    x: padding.left + (index / (data.length - 1)) * plotWidth,
    y: padding.top + plotHeight - (item.value / yMax) * plotHeight,
  }))
  const line = points.map((point) => `${point.x},${point.y}`).join(" ")

  return (
    <div
      className="chart-scroll"
      aria-label={`최근 ${range}의 기울기 변화 선 그래프`}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        className="chart"
        preserveAspectRatio="none"
      >
        <title>{`최근 ${range} 기울기 변화: ${data[0].value}도에서 ${data.at(-1)?.value}도로 변화`}</title>
        {[0, 2, 4, 6].map((tick) => {
          const y = padding.top + plotHeight - (tick / yMax) * plotHeight
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
                {tick}°
              </text>
            </g>
          )
        })}
        {[0, 3, 6, 9, 12].map((index) => (
          <text
            key={`${data[index].time}-${index}`}
            x={points[index].x}
            y={height - 10}
            textAnchor={index === 0 ? "start" : index === 12 ? "end" : "middle"}
            className="axis-label"
          >
            {data[index].time}
          </text>
        ))}
        <polyline points={line} className="trend-line trend-line-shadow" />
        <polyline points={line} className="trend-line" />
        {points.map((point, index) => (
          <g key={point.time}>
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

export default function App() {
  const [range, setRange] = useState<Range>("2시간")
  const [isLive, setIsLive] = useState(true)
  const updatedLabel = useMemo(
    () => (isLive ? "방금 전 업데이트" : "업데이트 일시정지됨"),
    [isLive],
  )
  const activeData = chartDatasets[range]
  const stats = useMemo(() => {
    const values = activeData.map(({ value }) => value)
    return {
      average: (
        values.reduce((sum, value) => sum + value, 0) / values.length
      ).toFixed(1),
      minimum: Math.min(...values).toFixed(1),
      maximum: Math.max(...values).toFixed(1),
    }
  }, [activeData])

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
            <span className="hidden text-[13px] text-[#738079] sm:inline">
              {updatedLabel}
            </span>
            <button
              type="button"
              onClick={() => setIsLive((current) => !current)}
              className="flex h-9 items-center gap-2 rounded-lg border border-[#d9e0dc] bg-white px-3 text-[13px] font-semibold text-[#405048] transition hover:border-[#aebdb5] hover:bg-[#f8faf9] focus:outline-none focus:ring-2 focus:ring-[#2b7561]/30"
              aria-label={
                isLive ? "센서 업데이트 일시정지" : "센서 업데이트 다시 시작"
              }
            >
              {isLive ? <PauseIcon /> : <PlayIcon />}
              <span>{isLive ? "일시정지" : "다시 시작"}</span>
            </button>
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
          <div className="flex w-fit items-center gap-2 rounded-full border border-[#cfe0d8] bg-[#edf7f2] px-3 py-1.5 text-[12px] font-semibold text-[#28634f]">
            <span
              className={`size-2 rounded-full ${
                isLive ? "animate-pulse bg-[#36a879]" : "bg-[#93a19a]"
              }`}
            />
            {isLive ? "정상 수신 중" : "수신 일시정지"}
          </div>
        </section>

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
                    3.8
                  </strong>
                  <span className="ml-2 mt-2 text-[30px] font-light text-[#a8c9bd]">
                    °
                  </span>
                </div>
                <div className="mt-5 flex items-center gap-2 text-[13px]">
                  <span className="rounded-md bg-[#2f6b5a] px-2 py-1 font-semibold text-[#d9eee7]">
                    +0.2°
                  </span>
                  <span className="text-[#9ebeb2]">10분 전 대비</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-5">
                <div className="mb-3 flex items-center justify-between text-[12px]">
                  <span className="text-[#9fbbb1]">안전 범위</span>
                  <span className="font-medium text-[#d6e7e1]">± 8.0°</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-black/20">
                  <div className="h-full w-[47.5%] rounded-full bg-[#7fd1b2]" />
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
                  최근 측정값의 시간대별 추이
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-[#f1f4f2] p-1">
                {ranges.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRange(option)}
                    className={`rounded-md px-3 py-1.5 text-[12px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#2b7561]/25 ${
                      range === option
                        ? "bg-white text-[#245c4c] shadow-[0_1px_4px_rgba(24,49,40,.1)]"
                        : "text-[#7b8680] hover:text-[#435149]"
                    }`}
                    aria-pressed={range === option}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <TrendChart data={activeData} range={range} />

            <div className="mt-4 grid grid-cols-3 divide-x divide-[#e7ebe8] border-t border-[#edf0ee] pt-5">
              <div className="pr-3">
                <p className="text-[11px] text-[#8a948f]">평균</p>
                <p className="mt-1 text-[16px] font-bold text-[#2a3731]">
                  {stats.average}°
                </p>
              </div>
              <div className="px-4">
                <p className="text-[11px] text-[#8a948f]">최저</p>
                <p className="mt-1 text-[16px] font-bold text-[#2a3731]">
                  {stats.minimum}°
                </p>
              </div>
              <div className="pl-4">
                <p className="text-[11px] text-[#8a948f]">최고</p>
                <p className="mt-1 text-[16px] font-bold text-[#2a3731]">
                  {stats.maximum}°
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: "센서 상태",
              value: "정상",
              meta: "오류 없음",
              accent: true,
            },
            { label: "측정 주기", value: "10초", meta: "자동 수집" },
            {
              label: "마지막 점검",
              value: "2025. 05. 20",
              meta: "다음 점검까지 24일",
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

        <p className="mt-6 text-center text-[11px] text-[#9aa29e]">
          현재 화면에는 예시 데이터가 표시되고 있습니다. 센서 연동 후 실시간
          값으로 대체됩니다.
        </p>
      </main>
    </div>
  )
}
