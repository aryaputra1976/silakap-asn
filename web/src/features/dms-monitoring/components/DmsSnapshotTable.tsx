import { Card, Table } from "react-bootstrap"

import type { DmsSnapshotItem } from "../types"
import {
  formatDmsDateTime,
  formatDmsDecimal,
} from "../utils"

type Props = {
  items: DmsSnapshotItem[]
  isLoading?: boolean
}

export function DmsSnapshotTable({
  items,
  isLoading = false,
}: Props) {
  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white border-0">
        <h6 className="mb-0">Snapshot ASN DMS</h6>
      </Card.Header>
      <Card.Body>
        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead>
              <tr>
                <th>ASN</th>
                <th>Unit</th>
                <th>Kelengkapan</th>
                <th>Skor</th>
                <th>Match</th>
                <th>Last Sync</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-5">
                    Belum ada data snapshot.
                  </td>
                </tr>
              ) : null}

              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="fw-semibold">
                      {item.namaSnapshot}
                    </div>
                    <div className="text-muted small">{item.nip}</div>
                  </td>
                  <td>
                    <div>{item.unorNama ?? item.unitKerjaRaw ?? "-"}</div>
                    <div className="text-muted small">
                      ID: {item.unorId ?? "-"}
                    </div>
                  </td>
                  <td>{item.kategoriKelengkapan ?? "-"}</td>
                  <td>{formatDmsDecimal(item.skorArsip)}</td>
                  <td>
                    <div className="small">
                      Pegawai:{" "}
                      {item.isMatchedPegawai ? "Matched" : "Belum"}
                    </div>
                    <div className="small">
                      Unit: {item.isMatchedUnor ? "Matched" : "Belum"}
                    </div>
                  </td>
                  <td>{formatDmsDateTime(item.lastSync)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  )
}