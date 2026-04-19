import { STATUS_FILTER } from "../constants/statusAsn"

type Props = {
  value: string
  onChange: (value: string) => void
}

export function StatusFilter({ value, onChange }: Props) {
  return (
    <div className="d-flex gap-2">

      {STATUS_FILTER.map((item) => (
        <button
          key={item.value}
          className={`btn btn-sm ${
            value === item.value ? "btn-primary" : "btn-light"
          }`}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}

    </div>
  )
}