// web/src/features/profil-asn/components/AsnStatsBar.tsx
import type { AsnStats } from "../hooks/useAsnStats"

function formatNumber(value?: number) {
  return (value ?? 0).toLocaleString("id-ID")
}

function StatItem({
  title,
  value,
  valueClassName,
}: {
  title: string
  value?: number
  valueClassName?: string
}) {
  return (
    <div className="d-flex flex-column">
      <span className="text-muted fs-8 fw-semibold text-uppercase mb-1">
        {title}
      </span>
      <span className={`fs-4 fw-bolder text-gray-900 ${valueClassName ?? ""}`}>
        {formatNumber(value)}
      </span>
    </div>
  )
}

export function AsnStatsBar({ stats, loading }: { stats: AsnStats; loading?: boolean }) {
  return (
    <div
      className="d-flex flex-wrap align-items-center gap-5"
      style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.2s" }}
    >
      <StatItem title="Total ASN" value={stats?.total} />
      <span className="separator separator-vertical h-35px d-none d-md-block" />
      <StatItem title="PNS" value={stats?.pns} valueClassName="text-primary" />
      <span className="separator separator-vertical h-35px d-none d-md-block" />
      <StatItem title="PPPK" value={stats?.pppk} valueClassName="text-success" />
      <span className="separator separator-vertical h-35px d-none d-md-block" />
      <StatItem
        title="PPPK Paruh Waktu"
        value={stats?.pppkParuhWaktu}
        valueClassName="text-warning"
      />
    </div>
  )
}