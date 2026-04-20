import { Alert, Card, Table } from "react-bootstrap"

import type { DmsImportResult } from "../types"
import { DmsBatchStatusBadge } from "./DmsBatchStatusBadge"

type Props = {
  result: DmsImportResult | null
}

export function DmsImportResultPanel({ result }: Props) {
  if (!result) {
    return null
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white border-0">
        <div className="d-flex align-items-center justify-content-between">
          <h6 className="mb-0">Hasil Import Terakhir</h6>
          <DmsBatchStatusBadge status={result.imported.status} />
        </div>
      </Card.Header>

      <Card.Body>
        <Alert
          variant={
            result.imported.status === "IMPORTED"
              ? "success"
              : result.imported.status === "PARTIAL"
                ? "warning"
                : "danger"
          }
        >
          <div className="fw-semibold mb-1">
            Batch #{result.batch.id} — {result.batch.namaFile}
          </div>
          <div>
            Total: {result.imported.totalRows} | Sukses:{" "}
            {result.imported.successRows} | Gagal:{" "}
            {result.imported.failedRows}
          </div>
        </Alert>

        {result.imported.errors.length > 0 ? (
          <div className="table-responsive">
            <Table size="sm" bordered hover className="mb-0">
              <thead>
                <tr>
                  <th>Baris</th>
                  <th>NIP</th>
                  <th>Pesan</th>
                </tr>
              </thead>
              <tbody>
                {result.imported.errors.map((item, index) => (
                  <tr key={`${item.rowNumber}-${item.nip}-${index}`}>
                    <td>{item.rowNumber}</td>
                    <td>{item.nip}</td>
                    <td>{item.message}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : null}
      </Card.Body>
    </Card>
  )
}