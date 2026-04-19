interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = "Terjadi kesalahan",
  message = "Silakan coba beberapa saat lagi.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="text-center py-10">
      {/* Icon */}
      <div className="mb-4">
        <i className="ki-duotone ki-information-5 fs-3x text-danger">
          <span className="path1" />
          <span className="path2" />
          <span className="path3" />
        </i>
      </div>

      {/* Title */}
      <div className="fw-bold fs-4 text-gray-800 mb-2">{title}</div>

      {/* Message */}
      <div className="text-gray-500 fs-6 mb-4">{message}</div>

      {/* Retry Button */}
      {onRetry && (
        <button className="btn btn-light-danger" onClick={onRetry}>
          Coba Lagi
        </button>
      )}
    </div>
  )
}