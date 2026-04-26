import { getStatusLabel, normalizeStatus } from "./import-ui"

export function ImportStatusBadge({ status }: { status: string }) {
  const s = normalizeStatus(status)

  const tone =
    s === "IMPORTED"
      ? "bg-emerald-50 text-emerald-700"
      : s === "VALIDATED"
        ? "bg-blue-50 text-blue-700"
        : s === "VALIDATED_WITH_ERROR" || s === "FAILED"
          ? "bg-rose-50 text-rose-700"
          : "bg-slate-100 text-slate-600"

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tone}`}>
      {getStatusLabel(status)}
    </span>
  )
}