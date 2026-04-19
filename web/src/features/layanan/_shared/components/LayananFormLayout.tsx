import React from "react"

interface Props {
  title: string
  children: React.ReactNode
  onSubmit?: () => void
  onCancel?: () => void
  submitLabel?: string
  loading?: boolean
}

export function LayananFormLayout({
  title,
  children,
  onSubmit,
  onCancel,
  submitLabel = "Simpan & Ajukan",
  loading = false,
}: Props) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
      </div>

      <div className="card-body">
        {children}
      </div>

      {(onSubmit || onCancel) && (
        <div className="card-footer d-flex justify-content-end gap-3">
          {onCancel && (
            <button
              type="button"
              className="btn btn-light"
              onClick={onCancel}
              disabled={loading}
            >
              Batal
            </button>
          )}

          {onSubmit && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onSubmit}
              disabled={loading}
            >
              {loading ? "Menyimpan..." : submitLabel}
            </button>
          )}
        </div>
      )}
    </div>
  )
}