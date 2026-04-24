import type { DisposisiMeta } from "../types"

interface Props {
  meta?: DisposisiMeta
  onChange: (page: number) => void
}

export function DisposisiPagination({ meta, onChange }: Props) {
  if (!meta || meta.totalPages <= 1) return null

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-5">
      <div className="text-muted fs-7">
        Halaman {meta.page} dari {meta.totalPages} - Total {meta.total} disposisi
      </div>
      <div className="d-flex gap-2">
        <button
          type="button"
          className="btn btn-sm btn-light"
          disabled={meta.page <= 1}
          onClick={() => onChange(meta.page - 1)}
        >
          Sebelumnya
        </button>
        <button
          type="button"
          className="btn btn-sm btn-light"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onChange(meta.page + 1)}
        >
          Berikutnya
        </button>
      </div>
    </div>
  )
}
