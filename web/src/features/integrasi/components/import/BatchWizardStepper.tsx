import type { ImportBatchItem, WizardStepKey } from "../../types"
import { ImportStatusBadge } from "./ImportStatusBadge"
import { formatDate } from "./import-ui"

type StepDef = {
  key: WizardStepKey
  label: string
  desc: string
}

const STEPS: StepDef[] = [
  { key: "preview", label: "Preview", desc: "Ringkasan file upload" },
  { key: "validation", label: "Validasi", desc: "Periksa data baris" },
  { key: "reference", label: "Referensi", desc: "Lengkapi referensi hilang" },
  { key: "review", label: "Review", desc: "Periksa kesiapan commit" },
  { key: "commit-result", label: "Selesai", desc: "Hasil commit data" },
]

const STEP_ORDER: Record<WizardStepKey, number> = {
  preview: 0,
  validation: 1,
  reference: 2,
  review: 3,
  "commit-result": 4,
}

type BatchWizardStepperProps = {
  batch: ImportBatchItem
  currentStep: WizardStepKey
  onStepClick: (step: WizardStepKey) => void
  onBack: () => void
}

export function BatchWizardStepper({
  batch,
  currentStep,
  onStepClick,
  onBack,
}: BatchWizardStepperProps) {
  const currentIndex = STEP_ORDER[currentStep]

  return (
    <div className="card shadow-sm mb-6">
      <div className="card-body py-5 px-6">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-4 mb-5">
          <div className="d-flex align-items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="btn btn-sm btn-light"
            >
              ← Kembali
            </button>
            <div>
              <div className="fw-bold text-gray-900 fs-5">{batch.batchCode}</div>
              <div className="text-gray-500 fs-8">{batch.fileName} - {formatDate(batch.updatedAt)}</div>
            </div>
          </div>
          <ImportStatusBadge status={batch.status} />
        </div>

        <div className="stepper stepper-pills stepper-column d-flex flex-column flex-xl-row flex-row-fluid">
          <div className="d-flex justify-content-center justify-content-xl-start flex-row-auto w-100 w-xl-300px">
            <div className="stepper-nav ps-lg-10 d-flex flex-row flex-xl-column gap-2 gap-xl-0 overflow-auto w-100">
              {STEPS.map((step, idx) => {
                const isCurrent = step.key === currentStep
                const isCompleted = idx < currentIndex
                const isClickable = idx <= currentIndex

                return (
                  <div
                    key={step.key}
                    className={[
                      "stepper-item py-2 px-3 rounded",
                      isCurrent ? "current bg-light-primary" : "",
                      isCompleted ? "text-muted" : "",
                      isClickable ? "cursor-pointer" : "opacity-50",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => isClickable && onStepClick(step.key)}
                  >
                    <div className="stepper-wrapper d-flex align-items-center gap-3">
                      <div className="stepper-icon w-30px h-30px flex-shrink-0">
                        {isCompleted ? (
                          <span className="badge badge-circle badge-success fs-8">✓</span>
                        ) : (
                          <span
                            className={`badge badge-circle fs-8 ${
                              isCurrent ? "badge-primary" : "badge-light-dark"
                            }`}
                          >
                            {idx + 1}
                          </span>
                        )}
                      </div>
                      <div className="stepper-label">
                        <h3
                          className={`stepper-title mb-0 fs-7 fw-bold ${
                            isCurrent ? "text-primary" : isCompleted ? "text-success" : "text-gray-600"
                          }`}
                        >
                          {step.label}
                        </h3>
                        <div className="stepper-desc fs-8 text-gray-500 d-none d-xl-block">
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
