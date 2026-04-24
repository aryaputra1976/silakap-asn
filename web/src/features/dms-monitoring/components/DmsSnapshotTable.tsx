import { Card, Table } from "react-bootstrap"
import { Link } from "react-router-dom"

import type { DmsSnapshotItem } from "../types"
import { formatDmsDateTime, formatDmsDecimal } from "../utils"

type Props = {
  items: DmsSnapshotItem[]
  isLoading?: boolean
  operatorMode?: boolean
}

export function DmsSnapshotTable({
  items,
  isLoading = false,
  operatorMode = false,
}: Props) {
  const renderAsnLink = (
    pegawaiId: string | null,
    content: React.ReactNode,
  ) => {
    if (!pegawaiId) {
      return content
    }

    return (
      <Link to={`/asn/${pegawaiId}`} className="text-decoration-none">
        {content}
      </Link>
    )
  }

  const renderBooleanCell = (value: boolean) => (
    <span
      className={value ? "text-success fw-semibold" : "text-danger fw-semibold"}
    >
      {value ? "\u2713" : "X"}
    </span>
  )

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white border-0">
        <h6 className="mb-0">
          {operatorMode ? "Rekap Kelengkapan DMS ASN" : "Snapshot ASN DMS"}
        </h6>
      </Card.Header>
      <Card.Body>
        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead>
              <tr>
                {operatorMode ? <th>No</th> : null}
                {operatorMode ? <th>NIP</th> : <th>ASN</th>}
                {operatorMode ? <th>Nama</th> : null}
                <th>{operatorMode ? "Unit Kerja" : "Unit"}</th>
                {operatorMode ? <th>DRH</th> : null}
                {operatorMode ? <th>CPNS</th> : null}
                {operatorMode ? <th>D2NP</th> : null}
                {operatorMode ? <th>SPMT</th> : null}
                {operatorMode ? <th>PNS</th> : null}
                <th>{operatorMode ? "Skor Arsip" : "Kelengkapan"}</th>
                <th>{operatorMode ? "Kategori Kelengkapan" : "Skor"}</th>
                {!operatorMode ? <th>Match</th> : null}
                {!operatorMode ? <th>Last Sync</th> : null}
              </tr>
            </thead>
            <tbody>
              {!isLoading && items.length === 0 ? (
                <tr>
                  <td
                    colSpan={operatorMode ? 10 : 6}
                    className="text-center text-muted py-5"
                  >
                    Belum ada data snapshot.
                  </td>
                </tr>
              ) : null}

              {items.map((item, index) => (
                <tr key={item.id}>
                  {operatorMode ? <td>{index + 1}</td> : null}
                  {operatorMode ? (
                    <td className="fw-semibold">
                      {renderAsnLink(item.pegawaiId, item.nip)}
                    </td>
                  ) : (
                    <td>
                      <div className="fw-semibold">
                        {renderAsnLink(
                          item.pegawaiId,
                          item.namaSnapshot,
                        )}
                      </div>
                      <div className="text-muted small">
                        {renderAsnLink(item.pegawaiId, item.nip)}
                      </div>
                    </td>
                  )}
                  {operatorMode ? (
                    <td>
                      {renderAsnLink(
                        item.pegawaiId,
                        item.namaSnapshot,
                      )}
                    </td>
                  ) : null}
                  <td>
                    <div>{item.unorNama ?? item.unitKerjaRaw ?? "-"}</div>
                    {!operatorMode ? (
                      <div className="text-muted small">
                        ID: {item.unorId ?? "-"}
                      </div>
                    ) : null}
                  </td>
                  {operatorMode ? <td>{renderBooleanCell(item.drh)}</td> : null}
                  {operatorMode ? <td>{renderBooleanCell(item.cpns)}</td> : null}
                  {operatorMode ? <td>{renderBooleanCell(item.d2np)}</td> : null}
                  {operatorMode ? <td>{renderBooleanCell(item.spmt)}</td> : null}
                  {operatorMode ? <td>{renderBooleanCell(item.pns)}</td> : null}
                  <td>
                    {operatorMode
                      ? formatDmsDecimal(item.skorArsip)
                      : item.kategoriKelengkapan ?? "-"}
                  </td>
                  <td>
                    {operatorMode
                      ? item.kategoriKelengkapan ?? "-"
                      : formatDmsDecimal(item.skorArsip)}
                  </td>
                  {!operatorMode ? (
                    <td>
                      <div className="small">
                        Pegawai:{" "}
                        {item.isMatchedPegawai ? "Matched" : "Belum"}
                      </div>
                      <div className="small">
                        Unit: {item.isMatchedUnor ? "Matched" : "Belum"}
                      </div>
                    </td>
                  ) : null}
                  {!operatorMode ? (
                    <td>{formatDmsDateTime(item.lastSync)}</td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  )
}
