import type { RankingStat } from "../../types"

interface Props {
  data?: RankingStat[]
}

export default function RankingTable({ data }: Props) {

  if (!data || data.length === 0) {
    return <div className="bg-white p-4 rounded-xl shadow">Tidak ada data</div>
  }

  return (
    <div className="bg-white rounded-xl shadow p-4">

      <h3 className="font-semibold mb-4">
        Top OPD ASN
      </h3>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2 w-10">#</th>
            <th className="p-2">OPD</th>
            <th className="p-2 text-right">ASN</th>
          </tr>
        </thead>

        <tbody>

          {data.map((r, i) => {

            const nama =
              r.namaUnor ??
              (r as any).nama_unor ??
              "-"

            const total =
              r.total ??
              (r as any).jumlah ??
              0

            return (
              <tr key={i} className="border-b">

                <td className="p-2">
                  {i + 1}
                </td>

                <td className="p-2">
                  {nama}
                </td>

                <td className="p-2 text-right font-semibold">
                  {total}
                </td>

              </tr>
            )
          })}

        </tbody>

      </table>

    </div>
  )
}