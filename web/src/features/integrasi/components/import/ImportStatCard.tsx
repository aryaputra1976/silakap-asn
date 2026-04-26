import { formatNumber } from "./import-ui"

export function ImportStatCard({
  label,
  value,
  helper,
  tone = "default",
}: {
  label: string
  value: number
  helper?: string
  tone?: "default" | "success" | "danger" | "info"
}) {
  const toneClass =
    tone === "success"
      ? "text-emerald-700"
      : tone === "danger"
        ? "text-rose-700"
        : tone === "info"
          ? "text-blue-700"
          : "text-slate-900"

  return (
    <div className="border rounded-xl p-3 bg-white">
      <div className="text-xs text-slate-500">{label}</div>

      <div className={`text-xl font-bold ${toneClass}`}>
        {formatNumber(value)}
      </div>

      {helper && (
        <div className="text-xs text-slate-500 mt-1">
          {helper}
        </div>
      )}
    </div>
  )
}