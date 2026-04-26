import {
  canCancelImportBatch,
  canCommitImportBatch,
  canValidateImportBatch,
  useIntegrasiImportWorkspace,
} from "../hooks/useIntegrasiImportWorkspace"
import { ImportActiveBatchPanel } from "../components/import/ImportActiveBatchPanel"
import { ImportBatchTable } from "../components/import/ImportBatchTable"
import { ImportErrorTable } from "../components/import/ImportErrorTable"
import { ImportMissingReferencesPanel } from "../components/import/ImportMissingReferencesPanel"
import { ImportPageHeader } from "../components/import/ImportPageHeader"
import { ImportStatCard } from "../components/import/ImportStatCard"
import { ImportUploadPanel } from "../components/import/ImportUploadPanel"
import { ImportCommitReadinessPanel } from "../components/import/ImportCommitReadinessPanel"

export default function IntegrasiImportPage() {
  const workspace = useIntegrasiImportWorkspace()

  return (
    <div className="space-y-6 p-6">
      <ImportPageHeader />

      {workspace.notice ? (
        <div
          className={
            workspace.notice.type === "success"
              ? "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
              : workspace.notice.type === "error"
                ? "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800"
                : "rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800"
          }
        >
          {workspace.notice.message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <ImportUploadPanel
          file={workspace.selectedFile}
          loading={workspace.localAction === "uploading"}
          disabled={workspace.isActionLoading}
          onChange={workspace.handleFileChange}
          onUpload={() => void workspace.handleUpload()}
        />

        <ImportActiveBatchPanel
          batch={workspace.selectedBatch}
          validateLoading={workspace.validateLoading}
          commitLoading={workspace.commitLoading}
          cancelLoading={workspace.localAction === "cancelling"}
          canValidate={
            workspace.selectedBatch
              ? canValidateImportBatch(workspace.selectedBatch)
              : false
          }
          canCommit={
            workspace.selectedBatch
              ? canCommitImportBatch(workspace.selectedBatch)
              : false
          }
          canCancel={
            workspace.selectedBatch
              ? canCancelImportBatch(workspace.selectedBatch)
              : false
          }
          disabled={workspace.isActionLoading}
          onValidate={() => void workspace.handleValidate()}
          onCommit={() => void workspace.handleCommit()}
          onCancel={() => void workspace.handleCancel()}
        />

        <ImportCommitReadinessPanel
          batch={workspace.selectedBatch}
          missingReferences={workspace.missingReferencesQuery.data}
          loading={workspace.missingReferencesQuery.isLoading}
        />        
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <ImportStatCard
          label="Total Rows"
          value={workspace.summary.totalRows}
          helper="Akumulasi halaman aktif"
        />
        <ImportStatCard
          label="Valid"
          value={workspace.summary.validRows}
          helper="Data lolos validasi"
          tone="success"
        />
        <ImportStatCard
          label="Invalid"
          value={workspace.summary.invalidRows}
          helper="Data perlu perbaikan"
          tone="danger"
        />
        <ImportStatCard
          label="Imported"
          value={workspace.summary.importedRows}
          helper="Sudah masuk master"
          tone="info"
        />
      </div>

      <ImportBatchTable
        batches={workspace.batches}
        loading={workspace.batchesQuery.isLoading}
        meta={workspace.meta}
        page={workspace.page}
        q={workspace.q}
        status={workspace.status}
        selectedBatchId={workspace.selectedBatchId}
        onPageChange={workspace.setPage}
        onSearchChange={workspace.setQ}
        onStatusChange={workspace.setStatus}
        onSelectBatch={workspace.setSelectedBatchId}
      />

      {workspace.selectedBatch ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <ImportErrorTable
            batch={workspace.selectedBatch}
            rows={workspace.errorsQuery.data?.data ?? []}
            loading={workspace.errorsQuery.isLoading}
          />

          <ImportMissingReferencesPanel
            data={workspace.missingReferencesQuery.data}
            loading={workspace.missingReferencesQuery.isLoading}
            disabled={workspace.isActionLoading}
            jabatanLoading={workspace.createJabatanLoading}
            unorLoading={workspace.createUnorLoading}
            pendidikanLoading={workspace.createPendidikanLoading}
            onCreateJabatan={() =>
              void workspace.handleCreateJabatanReferences()
            }
            onCreateUnor={() => void workspace.handleCreateUnorReferences()}
            onCreatePendidikan={() =>
              void workspace.handleCreatePendidikanReferences()
            }
          />
        </div>
      ) : null}
    </div>
  )
}