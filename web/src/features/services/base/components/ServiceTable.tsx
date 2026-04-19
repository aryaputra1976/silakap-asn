import React from "react"
import { ServiceItem } from "../types/service.types"
import ServiceStatusBadge from "./ServiceStatusBadge"

interface Props {

  data: ServiceItem[]

  loading?: boolean

  onDetail?: (id: string) => void

}

export default function ServiceTable({
  data,
  loading = false,
  onDetail,
}: Props) {

  if (loading) {
    return <div>Memuat data...</div>
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-muted">
        Belum ada data layanan
      </div>
    )
  }

  return (

    <div className="table-responsive">

      <table className="table table-row-bordered">

        <thead>

          <tr>
            <th>Nama</th>
            <th>NIP</th>
            <th>Unit Kerja</th>
            <th>Status</th>
            <th style={{ width: 120 }}>Aksi</th>
          </tr>

        </thead>

        <tbody>

          {data.map((row) => (

            <tr key={row.id}>

              <td>{row.nama}</td>

              <td>{row.nip}</td>

              <td>{row.unitKerja ?? "-"}</td>

              <td>

                <ServiceStatusBadge
                  status={row.status}
                />

              </td>

              <td>

                <button
                  type="button"
                  className="btn btn-sm btn-light"
                  onClick={() => onDetail?.(row.id)}
                >
                  Detail
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )

}