import { ReactNode, useEffect } from "react"

type Props = {
  open: boolean
  title?: string
  message?: ReactNode
  confirmText?: string
  cancelText?: string
  loading?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title = "Konfirmasi",
  message = "Apakah Anda yakin ingin melanjutkan?",
  confirmText = "Ya, lanjutkan",
  cancelText = "Batal",
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  // ESC key support
  useEffect(() => {
    if (!open) return

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onCancel()
      }
    }

    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [open, loading, onCancel])

  if (!open) return null

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={() => !loading && onCancel()}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">{title}</h5>
            <button
              type="button"
              className="btn btn-sm btn-icon"
              onClick={onCancel}
              disabled={loading}
            >
              ✕
            </button>
          </div>

          <div className="modal-body fs-6 text-gray-700">
            {message}
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-light"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelText}
            </button>

            <button
              className="btn btn-danger"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Memproses..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}