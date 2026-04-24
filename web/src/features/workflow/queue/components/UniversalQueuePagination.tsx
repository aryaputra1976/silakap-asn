interface Props {
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onChange: (page: number) => void
}

export function UniversalQueuePagination({ meta, onChange }: Props) {
  if (!meta || meta.totalPages <= 1) return null

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-5">
      <div className="text-muted fs-7">
        Halaman {meta.page} dari {meta.totalPages} - Total {meta.total} usulan
      </div>

      <div className="d-flex gap-2">
        <button
          type="button"
          disabled={meta.page <= 1}
          onClick={() => onChange(meta.page - 1)}
          className="btn btn-sm btn-light"
        >
          Sebelumnya
        </button>

        <button
          type="button"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onChange(meta.page + 1)}
          className="btn btn-sm btn-light"
        >
          Berikutnya
        </button>
      </div>
    </div>
  )
}
