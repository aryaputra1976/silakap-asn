import { formatNumber } from "./import-ui"

export function ImportStatCard({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="border rounded-xl p-3 bg-white">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-xl font-bold">{formatNumber(value)}</div>
    </div>
  )
}