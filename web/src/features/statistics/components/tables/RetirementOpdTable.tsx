type Row = {
  opd: string
  total: number | string
}

interface Props {
  data: Row[]
}

export default function RetirementOpdTable({ data }: Props) {

  if (!data || data.length === 0) return null

  const sorted = [...data]
    .sort((a, b) => Number(b.total) - Number(a.total))
    .slice(0, 10)

  const medal = (i: number) => {
    if (i === 0) return "🥇"
    if (i === 1) return "🥈"
    if (i === 2) return "🥉"
    return i + 1
  }

  return (

    <div className="card">

      <div className="card-header">
        <h3 className="card-title">
          OPD dengan ASN Pensiun Terbanyak
        </h3>
      </div>

      <div className="card-body">

        <div className="table-responsive">

          <table className="table align-middle table-row-dashed">

            <thead>
              <tr className="text-muted fw-bold text-uppercase">

                <th>#</th>
                <th>OPD</th>
                <th className="text-end">
                  ASN Pensiun
                </th>

              </tr>
            </thead>

            <tbody>

              {sorted.map((row, i) => (

                <tr key={i}>

                  <td className="fw-bold">
                    {medal(i)}
                  </td>

                  <td className="fw-bold">
                    {row.opd}
                  </td>

                  <td className="text-end text-danger fw-bold">
                    {Number(row.total).toLocaleString("id-ID")}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  )
}