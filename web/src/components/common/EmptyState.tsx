interface EmptyStateProps {
  title?: string
  description?: string
}

export function EmptyState({
  title = "Data tidak tersedia",
  description,
}: EmptyStateProps) {
  return (
    <div className="text-center py-10">
      <div className="text-muted fs-5 mb-2">{title}</div>
      {description && (
        <div className="text-gray-500 fs-7">{description}</div>
      )}
    </div>
  )
}