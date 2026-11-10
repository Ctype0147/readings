import { useState } from "react"

type PowerToggleProps = {
  power: boolean
  onChange: (power: boolean) => Promise<boolean>
}

export default function PowerToggle({ power, onChange }: PowerToggleProps) {
  const [hasError, setHasError] = useState(false)
  const [pending, setPending] = useState(false)

  const togglePower = async () => {
    setPending(true)
    setHasError(false)
    const succeeded = await onChange(!power)
    setHasError(!succeeded)
    setPending(false)
  }

  return (
    <div>
      <div className="control-row">
        <div>
          <p className="t-label control-name">LED 전원</p>
          <p className="t-caption power-status">{power ? "켜짐" : "꺼짐"}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={power}
          aria-label="LED 전원"
          className="switch-hit-area"
          disabled={pending}
          onClick={() => void togglePower()}
        >
          <span className="switch-track">
            <span className="switch-thumb" />
          </span>
        </button>
      </div>
      {hasError && (
        <p className="t-caption power-error" role="alert">
          전원 변경 실패, 다시 시도
        </p>
      )}
    </div>
  )
}
