import { WorkforceOpdRow } from "../types/workforce-opd-row"

interface Props {
  data: WorkforceOpdRow[]
}

export default function WorkforceDemandTable({ data }: Props) {

  if (!data || data.length === 0) return null

  return (

    <div className="card">

      <div className="card-header">
        <h3 className="card-title">
          Rekomendasi Formasi ASN
        </h3>
      </div>

      <div className="card-body">

        <table className="table align-middle">

          <thead>
            <tr>
              <th>#</th>
              <th>OPD</th>
              <th className="text-end">Kebutuhan</th>
              <th className="text-end">ASN Eksisting</th>
              <th className="text-end">Pensiun 5 Tahun</th>
              <th className="text-end">Gap</th>
              <th className="text-end">Rekomendasi Formasi</th>
            </tr>
          </thead>

          <tbody>

            {data.map((row, i) => (

              <tr key={row.namaUnor}>

                <td>{i + 1}</td>

                <td>{row.namaUnor}</td>

                <td className="text-end">
                  {row.kebutuhanAsn}
                </td>

                <td className="text-end">
                  {row.asnEksisting}
                </td>

                <td className="text-end">
                  {row.pensiun5Tahun}
                </td>

                <td className={`text-end fw-bold ${
                  row.gapAsn > 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}>
                  {row.gapAsn}
                </td>

                <td className="text-end font-semibold text-blue-600">
                  {row.rekomendasiFormasi}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  )

}