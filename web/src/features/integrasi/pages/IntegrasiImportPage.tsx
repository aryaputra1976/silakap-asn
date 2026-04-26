import { useState } from "react"
import {
  useIntegrasiImportBatches,
  useValidateIntegrasiBatch,
  useCommitIntegrasiBatch,
} from "../hooks/useIntegrasiImport"
import { uploadImportPegawaiFile, cancelImportBatch } from "../api/integrasi.api"

import { ImportPageHeader } from "../components/import/ImportPageHeader"
import { ImportUploadPanel } from "../components/import/ImportUploadPanel"
import { ImportActiveBatchPanel } from "../components/import/ImportActiveBatchPanel"
import { ImportBatchTable } from "../components/import/ImportBatchTable"

export default function IntegrasiImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [selectedBatch, setSelectedBatch] = useState<any>(null)

  const batchesQuery = useIntegrasiImportBatches({ page: 1, limit: 10 })
  const validate = useValidateIntegrasiBatch()
  const commit = useCommitIntegrasiBatch()

  const batches = batchesQuery.data?.data ?? []

  async function handleUpload() {
    if (!file) return
    await uploadImportPegawaiFile(file)
    batchesQuery.refetch()
  }

  return (
    <div className="space-y-6 p-6">
      <ImportPageHeader />

      <ImportUploadPanel
        file={file}
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        onUpload={handleUpload}
        loading={false}
      />

      <ImportActiveBatchPanel
        batch={selectedBatch}
        onValidate={() => validate.mutate(selectedBatch.id)}
        onCommit={() => commit.mutate(selectedBatch.id)}
        onCancel={() => cancelImportBatch(selectedBatch.id)}
      />

      <ImportBatchTable
        batches={batches}
        onSelect={setSelectedBatch}
      />
    </div>
  )
}