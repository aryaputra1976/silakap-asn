import { useNavigate } from "react-router-dom"
import type { UniversalQueueItem } from "../types"
import { StatusBadge } from "@/features/_shared/components/StatusBadge"

interface Props {
  data?: UniversalQueueItem[]
  loading: boolean
}

const serviceRouteMap: Record<string, string> = {
  PENSIUN: "pensiun",
  BEBAS_HUKDIS: "bebas-hukdis",
}

export function UniversalQueueTable({ data = [], loading }: Props) {

  const navigate = useNavigate()

  if (loading) {
    return <div className="text-center py-10">Loading...</div>
  }

  if (data.length === 0) {
    return <div className="text-center py-10">Tidak ada data</div>
  }

  return (
    <table className="table align-middle table-row-dashed">

      <thead>
        <tr>
          <th>NIP</th>
          <th>Nama</th>
          <th>Jenis</th>
          <th>Status</th>
          <th>Tanggal</th>
          <th>Aksi</th>
        </tr>
      </thead>

      <tbody>

        {data.map((item) => {

          const route = serviceRouteMap[item.jenis.kode]

          return (
            <tr key={item.id}>

              <td>{item.pegawai.nip}</td>

              <td>{item.pegawai.nama}</td>

              <td>{item.jenis.nama}</td>

              <td>
                <StatusBadge status={item.status} />
              </td>

              <td>
                {new Date(item.tanggalUsul).toLocaleDateString("id-ID")}
              </td>

              <td>

                <button
                  type="button"
                  className="btn btn-sm btn-light-primary"
                  disabled={!route}
                  onClick={() =>
                    route &&
                    navigate(`/layanan/${route}/${item.id}`)
                  }
                >
                  Detail
                </button>

              </td>

            </tr>
          )
        })}

      </tbody>

    </table>
  )
}