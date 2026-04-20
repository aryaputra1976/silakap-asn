import { Card, Table } from "react-bootstrap"

import type { DmsDashboardByUnorItem } from "../types"
import {
  formatDmsDateTime,
  formatDmsDecimal,
  formatDmsNumber,
} from "../utils"

type Props = {
  items: DmsDashboardByUnorItem[]
}

export function DmsDashboardByUnorTable({ items }: Props) {
  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white border-0">
        <h6 className="mb-0">Top Unit Organisasi</h6>
      </Card.Header>
      <Card.Body>
        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead>
              <tr>
                <th>Unit Organisasi</th>
                <th>Total ASN</th>
                <th>Rata-rata Skor</th>
                <th>Sinkronisasi Terakhir</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    Belum ada data unit organisasi.
                  </td>
                </tr>
              ) : null}

              {items.map((item) => (
                <tr key={`${item.unorId ?? "null"}-${item.unorNama ?? "tanpa-nama"}`}>
                  <td>
                    <div className="fw-semibold">
                      {item.unorNama ?? "-"}
                    </div>
                    <div className="text-muted small">
                      ID: {item.unorId ?? "-"}
                    </div>
                  </td>
                  <td>{formatDmsNumber(item.totalAsn)}</td>
                  <td>{formatDmsDecimal(item.avgSkorArsip)}</td>
                  <td>{formatDmsDateTime(item.latestSync)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  )
}