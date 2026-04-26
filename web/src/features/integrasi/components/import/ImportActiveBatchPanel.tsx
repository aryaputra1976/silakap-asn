import { ImportStatCard } from "./ImportStatCard"
import { ImportStatusBadge } from "./ImportStatusBadge"

export function ImportActiveBatchPanel({
  batch,
  onValidate,
  onCommit,
  onCancel,
  validateLoading,
  commitLoading,
  cancelLoading,
  canValidate,
  canCommit,
  canCancel,
  disabled,
}: any) {
  if (!batch) return null

  const progress =
    batch.totalRows === 0
      ? 0
      : Math.round((batch.validRows / batch.totalRows) * 100)

  return (
    <div className="border rounded-xl p-5 bg-white sticky top-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-bold text-lg">{batch.batchCode}</div>
          <div className="text-sm text-slate-500">{batch.fileName}</div>
        </div>

        <ImportStatusBadge status={batch.status} />
      </div>

      {/* Progress */}
      <div className="mt-4">
        <div className="text-xs text-slate-500 mb-1">
          Valid Progress
        </div>
        <div className="h-2 bg-slate-100 rounded-full">
          <div
            className="h-2 bg-blue-600 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {progress}%
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mt-4">
        <ImportStatCard label="Rows" value={batch.totalRows} />
        <ImportStatCard label="Valid" value={batch.validRows} tone="success" />
        <ImportStatCard label="Invalid" value={batch.invalidRows} tone="danger" />
        <ImportStatCard label="Imported" value={batch.importedRows} tone="info" />
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-5">
        <button
          disabled={disabled || !canValidate}
          onClick={onValidate}
          className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-40"
        >
          {validateLoading ? "Validating..." : "Validate"}
        </button>

        <button
          disabled={disabled || !canCommit}
          onClick={onCommit}
          className="flex-1 bg-emerald-600 text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-40"
        >
          {commitLoading ? "Committing..." : "Commit"}
        </button>

        <button
          disabled={disabled || !canCancel}
          onClick={onCancel}
          className="flex-1 bg-rose-600 text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-40"
        >
          {cancelLoading ? "Cancel..." : "Cancel"}
        </button>
      </div>
    </div>
  )
}