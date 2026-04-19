interface Props {
  meta?: {
    page: number
    totalPages: number
  }
  onChange: (page: number) => void
}

export function UniversalQueuePagination({ meta, onChange }: Props) {

  if (!meta || meta.totalPages <= 1) return null

  return (
    <div className="d-flex justify-content-end mt-5">

      <button
        type="button"
        disabled={meta.page <= 1}
        onClick={() => onChange(meta.page - 1)}
        className="btn btn-sm btn-light me-2"
      >
        Prev
      </button>

      <span className="align-self-center">
        {meta.page} / {meta.totalPages}
      </span>

      <button
        type="button"
        disabled={meta.page >= meta.totalPages}
        onClick={() => onChange(meta.page + 1)}
        className="btn btn-sm btn-light ms-2"
      >
        Next
      </button>

    </div>
  )
}