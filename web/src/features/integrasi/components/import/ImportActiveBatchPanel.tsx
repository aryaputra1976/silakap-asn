import { ImportStatCard } from "./ImportStatCard"
import { ImportStatusBadge } from "./ImportStatusBadge"

export function ImportActiveBatchPanel({
  batch,
  onValidate,
  onCommit,
  onCancel,
}: any) {
  if (!batch) return null

  return (
    <div className="border rounded-xl p-5 bg-white">
      <div className="flex justify-between">
        <div>
          <div className="font-bold">{batch.batchCode}</div>
          <div className="text-sm text-slate-500">{batch.fileName}</div>
        </div>

        <ImportStatusBadge status={batch.status} />
      </div>

      <div className="grid grid-cols-4 gap-3 mt-4">
        <ImportStatCard label="Rows" value={batch.totalRows} />
        <ImportStatCard label="Valid" value={batch.validRows} />
        <ImportStatCard label="Invalid" value={batch.invalidRows} />
        <ImportStatCard label="Imported" value={batch.importedRows} />
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={onValidate}>Validate</button>
        <button onClick={onCommit}>Commit</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}