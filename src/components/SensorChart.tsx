import { useEffect, useRef, useState } from "react"
import type { Reading } from "../lib/device"
import { SENSOR_MAX } from "../product"

type SensorChartProps = {
  readings: Reading[]
}

const HEIGHT = 200
const PADDING = { left: 40, right: 8, top: 8, bottom: 20 }

export default function SensorChart({ readings }: SensorChartProps) {
  const containerRef = useRef<HTMLElement>(null)
  const [width, setWidth] = useState(320)

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(1, entry.contentRect.width))
    })
    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [])

  const plotWidth = width - PADDING.left - PADDING.right
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom
  const points = readings
    .map((reading, index) => {
      const x =
        PADDING.left +
        (readings.length === 1
          ? plotWidth
          : (index / (readings.length - 1)) * plotWidth)
      const y =
        PADDING.top +
        plotHeight -
        (Math.min(SENSOR_MAX, Math.max(0, reading.value)) / SENSOR_MAX) *
          plotHeight
      return `${x},${y}`
    })
    .join(" ")
  const currentValue = readings.at(-1)?.value

  return (
    <section
      ref={containerRef}
      className="sensor-chart"
      aria-label="실시간 센서값"
    >
      {readings.length === 0 ? (
        <p className="t-body chart-empty">
          센서를 연결하면 값이 여기에 그려집니다.
        </p>
      ) : (
        <svg
          width={width}
          height={HEIGHT}
          viewBox={`0 0 ${width} ${HEIGHT}`}
          role="img"
          aria-label={`센서값 추이, 현재 ${currentValue?.toLocaleString("ko-KR")}`}
        >
          {[0, SENSOR_MAX / 2, SENSOR_MAX].map((tick) => {
            const y =
              PADDING.top + plotHeight - (tick / SENSOR_MAX) * plotHeight
            return (
              <g key={tick}>
                <line
                  className="chart-grid-line"
                  x1={PADDING.left}
                  x2={width - PADDING.right}
                  y1={y}
                  y2={y}
                />
                <text
                  className="chart-axis-label"
                  x={PADDING.left - 8}
                  y={y + 4}
                  textAnchor="end"
                >
                  {Math.round(tick).toLocaleString("ko-KR")}
                </text>
              </g>
            )
          })}
          <text
            className="chart-axis-label"
            x={PADDING.left}
            y={HEIGHT - 2}
            textAnchor="start"
          >
            −60s
          </text>
          <text
            className="chart-axis-label"
            x={width - PADDING.right}
            y={HEIGHT - 2}
            textAnchor="end"
          >
            지금
          </text>
          <polyline className="chart-line" points={points} />
        </svg>
      )}
    </section>
  )
}
