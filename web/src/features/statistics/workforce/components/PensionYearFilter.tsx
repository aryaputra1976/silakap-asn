interface Props {
  tahun: number
  setTahun: (tahun: number) => void
}

export default function PensionYearFilter({ tahun, setTahun }: Props) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, index) => currentYear + index)

  return (
    <div className="card">
      <div className="card-body d-flex align-items-center gap-3">
        <label htmlFor="pension-year" className="fw-semibold mb-0">
          Tahun Analisis
        </label>
        <select
          id="pension-year"
          className="form-select w-auto"
          value={tahun}
          onChange={(event) => setTahun(Number(event.target.value))}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
