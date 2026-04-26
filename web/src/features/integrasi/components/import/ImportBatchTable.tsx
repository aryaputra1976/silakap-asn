import { formatNumber, formatDate } from "./import-ui"
import { ImportStatusBadge } from "./ImportStatusBadge"

export function ImportBatchTable({ batches, onSelect }: any) {
  return (
    <div className="border rounded-xl bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Batch</th>
            <th>File</th>
            <th>Rows</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {batches.map((b: any) => (
            <tr key={b.id}>
              <td>{b.batchCode}</td>
              <td>{b.fileName}</td>
              <td>{formatNumber(b.totalRows)}</td>
              <td><ImportStatusBadge status={b.status} /></td>
              <td>
                <button onClick={() => onSelect(b)}>Pilih</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}