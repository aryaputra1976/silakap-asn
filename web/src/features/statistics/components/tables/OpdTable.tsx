type OpdRow = {
  unorId: number | null
  namaUnor: string
  total: number
  pns: number
  pppk: number
  pppkParuhWaktu: number
}

interface Props {
  data: OpdRow[]
  totalAsn?: number
  loading?: boolean
}

export default function OpdTable({ data, totalAsn, loading }: Props) {

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-10">
        <span className="spinner-border text-primary" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center text-gray-500 py-10">
          Data OPD tidak tersedia
        </div>
      </div>
    )
  }

  // sort OPD terbesar
  const sorted = [...data].sort((a, b) => b.total - a.total)

  // ambil top 10
  const top = sorted.slice(0, 10)

  // fallback jika total ASN global tidak dikirim
  const grandTotal =
    totalAsn ??
    data.reduce((sum, r) => sum + r.total, 0)

  const percent = (value: number) => {
    if (!grandTotal) return "0.0"
    return ((value / grandTotal) * 100).toFixed(1)
  }

  const rankBadge = (i: number) => {
    if (i === 0) return "🥇"
    if (i === 1) return "🥈"
    if (i === 2) return "🥉"
    return i + 1
  }

  return (

    <div className="card">

      <div className="card-header border-0 pt-6">
        <h3 className="card-title fw-bold">
          Top OPD ASN
        </h3>
      </div>

      <div className="card-body pt-0">

        <div className="table-responsive">

          <table className="table align-middle table-row-dashed fs-6 gy-5">

            <thead>
              <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">

                <th className="min-w-60px">#</th>

                <th className="min-w-300px">
                  OPD
                </th>

                <th className="text-end min-w-120px">
                  Total ASN
                </th>

                <th className="text-end min-w-80px">
                  %
                </th>

                <th className="text-end min-w-80px">
                  PNS
                </th>

                <th className="text-end min-w-80px">
                  PPPK
                </th>

                <th className="text-end min-w-150px">
                  PPPK Paruh Waktu
                </th>

              </tr>
            </thead>

            <tbody className="text-gray-700 fw-semibold">

              {top.map((row, i) => {

                const highlight =
                  i === 0 ? "bg-light-success" : ""

                return (

                  <tr
                    key={row.unorId ?? i}
                    className={highlight}
                  >

                    <td className="fw-bold">
                      {rankBadge(i)}
                    </td>

                    <td className="fw-bold">
                      {row.namaUnor ?? "-"}
                    </td>

                    <td className="text-end fw-bold text-primary">
                      {row.total.toLocaleString("id-ID")}
                    </td>

                    <td className="text-end text-gray-600">
                      {percent(row.total)}%
                    </td>

                    <td className="text-end">
                      {row.pns.toLocaleString("id-ID")}
                    </td>

                    <td className="text-end">
                      {row.pppk.toLocaleString("id-ID")}
                    </td>

                    <td className="text-end">
                      {row.pppkParuhWaktu.toLocaleString("id-ID")}
                    </td>

                  </tr>

                )
              })}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  )
}