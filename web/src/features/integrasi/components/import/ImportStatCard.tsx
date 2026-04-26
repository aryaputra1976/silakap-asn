import { formatNumber } from "./import-ui"

type ImportStatCardProps = {
  label: string
  value: number
  helper?: string
  tone?: "default" | "success" | "danger" | "info" | "warning"
}

export function ImportStatCard({
  label,
  value,
  helper,
  tone = "default",
}: ImportStatCardProps) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "danger"
        ? "text-danger"
        : tone === "info"
          ? "text-primary"
          : tone === "warning"
            ? "text-warning"
            : "text-gray-900"

  return (
    <div className="card shadow-sm h-100">
      <div className="card-body py-5">
        <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-2">
          {label}
        </div>
        <div className={`fw-bolder fs-2 ${toneClass}`}>
          {formatNumber(value)}
        </div>
        {helper ? <div className="text-gray-600 fs-7 mt-1">{helper}</div> : null}
      </div>
    </div>
  )
}