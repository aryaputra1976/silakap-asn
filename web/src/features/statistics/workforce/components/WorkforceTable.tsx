import { Link } from "react-router-dom"
import type { WorkforceOpd } from "../types"

interface Props {
  data?: WorkforceOpd[]
}

export default function WorkforceTable({ data }: Props) {
  if (!data) return null

  return (
    <div className="bg-white rounded-xl shadow overflow-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="p-3">OPD</th>
            <th className="p-3">ASN</th>
            <th className="p-3">Kebutuhan</th>
            <th className="p-3">Gap</th>
            <th className="p-3">Pensiun</th>
            <th className="p-3">Rekomendasi</th>
            <th className="p-3"></th>
          </tr>
        </thead>

        <tbody>
          {data.map((opd) => (
            <tr key={opd.unorId} className="border-t">
              <td className="p-3">{opd.namaUnor}</td>
              <td className="p-3">{opd.asnEksisting}</td>
              <td className="p-3">{opd.kebutuhanAsn}</td>
              <td className="p-3">{opd.gapAsn}</td>
              <td className="p-3">{opd.pensiun5Tahun}</td>
              <td className="p-3">{opd.rekomendasiFormasi}</td>
              <td className="p-3">
                <Link
                  to={`/statistics/workforce/${opd.unorId}`}
                  className="text-blue-600"
                >
                  Detail
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}