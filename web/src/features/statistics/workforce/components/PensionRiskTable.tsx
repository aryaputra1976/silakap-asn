type Row = {
  opd: string
  jabatan: string
  jumlah: number
}

interface Props {
  data: Row[]
}

export default function PensionRiskTable({ data }: Props) {

  if (!data) return null

  return (

    <div className="card">

      <div className="card-header">
        <h3 className="card-title">
          OPD Risiko Pensiun
        </h3>
      </div>

      <div className="card-body">

        <table className="table align-middle">

          <thead>

            <tr>
              <th>#</th>
              <th>OPD</th>
              <th>Jabatan</th>
              <th className="text-end">
                ASN
              </th>
            </tr>

          </thead>

          <tbody>

            {data.map((row, i) => (

              <tr key={i}>

                <td>{i + 1}</td>

                <td>{row.opd}</td>

                <td>{row.jabatan}</td>

                <td className="text-end">
                  {row.jumlah}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  )
}