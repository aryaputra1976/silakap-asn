import type { DisposisiItem } from "../types"

interface Props {
  data: DisposisiItem[]
}

export function DisposisiTable({ data }: Props) {

  if (!data || data.length === 0) {
    return <div className="text-muted">Tidak ada disposisi</div>
  }

  return (

    <table className="table">

      <thead>

        <tr>
          <th>Layanan</th>
          <th>Pegawai</th>
          <th>Tujuan</th>
          <th>Tanggal</th>
        </tr>

      </thead>

      <tbody>

        {data.map((row) => (

          <tr key={row.id}>

            <td>{row.layanan}</td>

            <td>{row.pegawai}</td>

            <td>{row.tujuan}</td>

            <td>
              {new Date(row.tanggal).toLocaleDateString("id-ID")}
            </td>

          </tr>

        ))}

      </tbody>

    </table>

  )

}