import { useEffect, useMemo, useState } from "react"
import { useIntegrasiImportBatchDetail, useIntegrasiImportErrors, useIntegrasiMissingReferences, useValidateIntegrasiBatch, useCommitIntegrasiBatch, useCreatePendidikanReferences } from "../hooks/useIntegrasiImport"
import { cancelImportBatch, updateImportRow } from "../api/integrasi.api"
import type { ImportErrorRow, WizardStepKey, MissingReferencesResponse } from "../types"
import { getCommitReadiness } from "../utils/commit-readiness"
import type { ImportEditRowPayload } from "../components/import/ImportEditRowModal"
import { BatchWizardStepper } from "../components/import/BatchWizardStepper"
import { BatchImportPreviewStep } from "./BatchImportPreviewStep"
import { BatchImportValidationStep } from "./BatchImportValidationStep"
import { BatchImportReferenceResolveStep } from "./BatchImportReferenceResolveStep"
import { BatchImportReviewStep } from "./BatchImportReviewStep"
import { BatchImportCommitResultStep } from "./BatchImportCommitResultStep"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function deriveInitialStep(
  status: string,
  missing: MissingReferencesResponse | undefined,
): WizardStepKey {
  const s = status.toUpperCase()
  if (s === "IMPORTED" || s === "COMMITTING") return "commit-result"
  if (s === "VALIDATED") {
    const jabatanMissing = missing?.jabatan.length ?? 0
    const unorMissing = missing?.unor.length ?? 0
    if (jabatanMissing > 0 || unorMissing > 0) return "reference"
    return "review"
  }
  if (s === "VALIDATED_WITH_ERROR" || s === "VALIDATING" || s === "FAILED") return "validation"
  return "preview"
}

function canValidate(status: string): boolean {
  return ["DRAFT", "VALIDATED_WITH_ERROR", "FAILED"].includes(status.toUpperCase())
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message)
  }
  return "Terjadi kesalahan. Silakan coba lagi."
}

// ─── Main component ───────────────────────────────────────────────────────────

type BatchImportCreatePageProps = {
  batchId: string
  onBack: () => void
  onNewUpload: () => void
}

export function BatchImportCreatePage({ batchId, onBack, onNewUpload }: BatchImportCreatePageProps) {
  const [currentStep, setCurrentStep] = useState<WizardStepKey>("preview")
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [errorRowsPage, setErrorRowsPage] = useState(1)
  const [selectedErrorRow, setSelectedErrorRow] = useState<ImportErrorRow | null>(null)
  const [updateRowLoading, setUpdateRowLoading] = useState(false)
  const [updateRowError, setUpdateRowError] = useState<string | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)

  const batchQuery = useIntegrasiImportBatchDetail(batchId)
  const batch = batchQuery.data

  const errorsQuery = useIntegrasiImportErrors(batchId, { page: errorRowsPage, limit: 25 })
  const missingQuery = useIntegrasiMissingReferences(batchId)

  const validateMutation = useValidateIntegrasiBatch()
  const commitMutation = useCommitIntegrasiBatch()
  const createPendidikanMutation = useCreatePendidikanReferences()

  // Set initial step once batch and missing data are available
  useEffect(() => {
    if (batch) {
      setCurrentStep(deriveInitialStep(batch.status, missingQuery.data))
    }
  }, [batch?.status]) // eslint-disable-line react-hooks/exhaustive-deps

  const readiness = useMemo(() => {
    if (!batch) return null
    return getCommitReadiness(batch, missingQuery.data, missingQuery.isLoading)
  }, [batch, missingQuery.data, missingQuery.isLoading])

  const isActionLoading =
    validateMutation.isPending ||
    commitMutation.isPending ||
    createPendidikanMutation.isPending ||
    updateRowLoading ||
    cancelLoading

  async function handleValidate() {
    try {
      setNotice(null)
      await validateMutation.mutateAsync(batchId)
      await batchQuery.refetch()
      await errorsQuery.refetch()
      await missingQuery.refetch()
      setCurrentStep("validation")
      setNotice({ type: "success", message: "Validasi selesai." })
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error) })
    }
  }

  async function handleCommit() {
    // Guard: tolak commit jika readiness belum siap.
    // readiness dihitung dari getCommitReadiness — sumber kebenaran tunggal.
    if (!readiness?.isReady) {
      const reason = readiness?.blockingReasons
        .filter((r) => r.required)
        .map((r) => r.label)
        .join(", ")
      setNotice({
        type: "error",
        message: reason
          ? `Commit diblok: ${reason} belum terpenuhi.`
          : "Referensi wajib belum lengkap. Selesaikan terlebih dahulu.",
      })
      return
    }

    try {
      setNotice(null)
      await commitMutation.mutateAsync(batchId)
      await batchQuery.refetch()
      setCurrentStep("commit-result")
      setNotice({ type: "success", message: "Commit berhasil dijalankan." })
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error) })
    }
  }

  async function handleCancel() {
    try {
      setCancelLoading(true)
      setNotice(null)
      await cancelImportBatch(batchId)
      await batchQuery.refetch()
      setNotice({ type: "success", message: "Batch berhasil dibatalkan." })
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error) })
    } finally {
      setCancelLoading(false)
    }
  }

  async function handleCreatePendidikan() {
    try {
      setNotice(null)
      await createPendidikanMutation.mutateAsync(batchId)
      await missingQuery.refetch()
      await batchQuery.refetch()
      setNotice({ type: "success", message: "Referensi pendidikan berhasil diproses." })
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error) })
    }
  }

  async function handleUpdateRow(rowId: string, payload: ImportEditRowPayload) {
    try {
      setUpdateRowLoading(true)
      setUpdateRowError(null)
      await updateImportRow(batchId, rowId, payload)
      await errorsQuery.refetch()
      await batchQuery.refetch()
      await missingQuery.refetch()
      setSelectedErrorRow(null)
    } catch (error) {
      setUpdateRowError(getErrorMessage(error))
    } finally {
      setUpdateRowLoading(false)
    }
  }

  if (batchQuery.isLoading) {
    return (
      <div className="card shadow-sm">
        <div className="card-body py-10 text-center text-gray-500 fs-7">
          Memuat detail batch...
        </div>
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="card shadow-sm">
        <div className="card-body py-10 text-center">
          <div className="fw-bold text-gray-900 fs-5 mb-2">Batch tidak ditemukan</div>
          <button type="button" onClick={onBack} className="btn btn-sm btn-light mt-3">
            ← Kembali
          </button>
        </div>
      </div>
    )
  }

  const errorsMeta = errorsQuery.data?.meta
  const errorRowsTotalPages = errorsMeta?.totalPages ?? 1

  return (
    <div>
      {notice ? (
        <div
          className={`rounded-2 border px-4 py-3 mb-4 fs-7 fw-medium ${
            notice.type === "success"
              ? "border-success bg-light-success text-success"
              : "border-danger bg-light-danger text-danger"
          }`}
        >
          {notice.message}
        </div>
      ) : null}

      <BatchWizardStepper
        batch={batch}
        currentStep={currentStep}
        onStepClick={setCurrentStep}
        onBack={onBack}
      />

      {currentStep === "preview" && (
        <BatchImportPreviewStep
          batch={batch}
          onValidate={() => void handleValidate()}
          validateLoading={validateMutation.isPending}
          canValidate={canValidate(batch.status)}
          disabled={isActionLoading}
        />
      )}

      {currentStep === "validation" && (
        <BatchImportValidationStep
          batch={batch}
          rows={errorsQuery.data?.data ?? []}
          rowsLoading={errorsQuery.isLoading}
          rowsPage={errorRowsPage}
          rowsTotalPages={errorRowsTotalPages}
          rowsTotal={errorsQuery.data?.meta?.total ?? 0}
          onRowsPageChange={(p) => { setErrorRowsPage(p) }}
          onValidate={() => void handleValidate()}
          validateLoading={validateMutation.isPending}
          canValidate={canValidate(batch.status)}
          disabled={isActionLoading}
          onEditRow={setSelectedErrorRow}
          selectedErrorRow={selectedErrorRow}
          updateRowLoading={updateRowLoading}
          updateRowError={updateRowError}
          onCloseEditRow={() => { setSelectedErrorRow(null); setUpdateRowError(null) }}
          onUpdateRow={handleUpdateRow}
          missingReferences={missingQuery.data}
          onNext={() => setCurrentStep("reference")}
        />
      )}

      {currentStep === "reference" && (
        <BatchImportReferenceResolveStep
          batch={batch}
          missingReferences={missingQuery.data}
          loading={missingQuery.isLoading}
          disabled={isActionLoading}
          pendidikanLoading={createPendidikanMutation.isPending}
          onCreatePendidikan={() => void handleCreatePendidikan()}
          onNext={() => setCurrentStep("review")}
        />
      )}

      {currentStep === "review" && readiness && (
        <BatchImportReviewStep
          batch={batch}
          readiness={readiness}
          readinessLoading={missingQuery.isLoading}
          onCommit={() => void handleCommit()}
          commitLoading={commitMutation.isPending}
          onCancel={() => void handleCancel()}
          cancelLoading={cancelLoading}
          disabled={isActionLoading}
          onGoToValidation={() => setCurrentStep("validation")}
          onGoToReference={() => setCurrentStep("reference")}
        />
      )}

      {currentStep === "commit-result" && (
        <BatchImportCommitResultStep
          batchId={batchId}
          batch={batch}
          onNewUpload={onNewUpload}
        />
      )}
    </div>
  )
}
