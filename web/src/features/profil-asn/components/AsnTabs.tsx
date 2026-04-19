type Props = {
  active: string
  onChange: (tab: string) => void
}

const tabs = [
  { id: "profil", label: "Profil" },
  { id: "jabatan", label: "Riwayat Jabatan" },
  { id: "pangkat", label: "Riwayat Pangkat" },
  { id: "pendidikan", label: "Riwayat Pendidikan" },
  { id: "diklat", label: "Riwayat Diklat" },
]

export function AsnTabs({ active, onChange }: Props) {
  return (
    <ul className="nav nav-tabs mb-5">

      {tabs.map(tab => (
        <li className="nav-item" key={tab.id}>
          <button
            className={`nav-link ${active === tab.id ? "active" : ""}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        </li>
      ))}

    </ul>
  )
}