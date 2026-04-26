import { getStatusLabel, normalizeStatus } from "./import-ui"

export function ImportStatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase()

  const map: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-700",
    VALIDATED: "bg-blue-100 text-blue-700",
    VALIDATED_WITH_ERROR: "bg-amber-100 text-amber-700",
    IMPORTED: "bg-emerald-100 text-emerald-700",
    FAILED: "bg-rose-100 text-rose-700",
    CANCELLED: "bg-slate-200 text-slate-600",
  }

  const label = s.replace(/_/g, " ") // <-- FIX DI SINI

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[s]}`}>
      {label}
    </span>
  )
}