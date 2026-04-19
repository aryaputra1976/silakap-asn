type Props = {
  status: string
  onChange: (v: string) => void
}

export function AsnStatusTabs({ status, onChange }: Props) {

  const tabs = [
    { key: "PNS", label: "PNS" },
    { key: "PPPK", label: "PPPK" },
    { key: "PPPK_PARUH_WAKTU", label: "PPPK Paruh Waktu" }
  ]

  return (

    <div className="d-flex gap-2">

      {tabs.map((t) => {

        const active = status === t.key

        return (

          <button
            key={t.key}
            className={`btn btn-sm ${
              active ? "btn-primary" : "btn-light"
            }`}
            onClick={() => onChange(t.key)}
          >
            {t.label}
          </button>

        )

      })}

    </div>

  )

}