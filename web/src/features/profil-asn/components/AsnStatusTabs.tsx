// web/src/features/profil-asn/components/AsnStatusTabs.tsx
type Props = {
  status: string
  onChange: (value: string) => void
}

const tabs = [
  { key: "", label: "Semua" },
  { key: "PNS", label: "PNS" },
  { key: "PPPK", label: "PPPK" },
  { key: "PPPK_PARUH_WAKTU", label: "PPPK Paruh Waktu" },
]

export function AsnStatusTabs({ status, onChange }: Props) {
  return (
    <div className="d-flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = status === tab.key

        return (
          <button
            key={tab.key}
            type="button"
            className={`btn btn-sm px-4 py-3 fw-bolder ${
              active ? "btn-primary" : "btn-light"
            }`}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}