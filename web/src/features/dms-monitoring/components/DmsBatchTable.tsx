import { Button, Card, ProgressBar, Table } from "react-bootstrap"
import { Link } from "react-router-dom"

import type { DmsBatchItem } from "../types"
import {
  formatDmsDateTime,
  formatDmsNumber,
  formatDmsPercent,
} from "../utils"
import { DmsBatchStatusBadge } from "./DmsBatchStatusBadge"

type Props = {
  items: DmsBatchItem[]
  isLoading?: boolean
}

export function DmsBatchTable({ items, isLoading = false }: Props) {
  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white border-0 pb-0">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h5 className="mb-1">Daftar Batch DMS</h5>
            <p className="text-muted mb-0">
              Monitoring batch import, status, dan hasil proses.
            </p>
          </div>
        </div>
      </Card.Header>

      <Card.Body>
        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead>
              <tr>
                <th>Batch</th>
                <th>Unit</th>
                <th>Status</th>
                <th>Hasil</th>
                <th>Importir</th>
                <th>Waktu</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {!isLoading && items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-5">
                    Belum ada data batch DMS.
                  </td>
                </tr>
              ) : null}

              {items.map((item) => {
                const progress = formatDmsPercent(
                  item.successRows,
                  item.totalRows,
                )

                return (
                  <tr key={item.id}>
                    <td>
                      <div className="fw-semibold">{item.namaFile}</div>
                      <div className="text-muted small">
                        Batch #{item.id}
                      </div>
                      {item.periodeLabel ? (
                        <div className="text-muted small">
                          Periode: {item.periodeLabel}
                        </div>
                      ) : null}
                    </td>

                    <td>
                      <div>{item.unorNama ?? "-"}</div>
                      <div className="text-muted small">
                        ID: {item.unorId ?? "-"}
                      </div>
                    </td>

                    <td>
                      <DmsBatchStatusBadge status={item.status} />
                    </td>

                    <td style={{ minWidth: 220 }}>
                      <div className="d-flex justify-content-between small mb-2">
                        <span>
                          Sukses {formatDmsNumber(item.successRows)}
                        </span>
                        <span>
                          Gagal {formatDmsNumber(item.failedRows)}
                        </span>
                      </div>
                      <ProgressBar
                        now={
                          item.totalRows > 0
                            ? (item.successRows / item.totalRows) * 100
                            : 0
                        }
                        label={progress}
                      />
                      <div className="text-muted small mt-2">
                        Total {formatDmsNumber(item.totalRows)} baris
                      </div>
                    </td>

                    <td>
                      <div>{item.importedByUsername ?? "-"}</div>
                    </td>

                    <td>
                      <div className="small">
                        {formatDmsDateTime(item.importedAt)}
                      </div>
                    </td>

                    <td className="text-end">
                    <Link
                        to={`/dms-monitoring/batches/${item.id}`}
                        className="btn btn-primary btn-sm"
                    >
                        Detail
                    </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  )
}