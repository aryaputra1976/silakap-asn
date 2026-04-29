// web/src/features/profil-asn/components/AsnPagination.tsx
interface Props {
  page: number
  total: number
  limit: number
  onPage: (value: number) => void
}

function buildPages(current: number, totalPages: number): Array<number | string> {
  const delta = 1
  const range: number[] = []
  const pages: Array<number | string> = []
  let last: number | undefined

  for (let i = 1; i <= totalPages; i += 1) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i)
    }
  }

  for (const page of range) {
    if (last !== undefined) {
      if (page - last === 2) {
        pages.push(last + 1)
      } else if (page - last > 2) {
        pages.push("...")
      }
    }

    pages.push(page)
    last = page
  }

  return pages
}

export function AsnPagination({ page, total, limit, onPage }: Props) {
  const safeLimit = Math.max(1, limit)
  const totalPages = Math.max(1, Math.ceil(total / safeLimit))
  const pages = buildPages(page, totalPages)
  const start = total === 0 ? 0 : (page - 1) * safeLimit + 1
  const end = Math.min(page * safeLimit, total)

  return (
    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 pt-5">
      <div className="text-muted fs-7 fw-semibold">
        {total === 0
          ? "Tidak ada data"
          : `Menampilkan ${start}-${end} dari ${total.toLocaleString("id-ID")} ASN`}
      </div>

      <div className="d-flex align-items-center gap-2 flex-wrap justify-content-md-end">
        <button
          type="button"
          className="btn btn-sm btn-light"
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
        >
          Prev
        </button>

        {pages.map((item, index) =>
          item === "..." ? (
            <span
              key={`dots-${index}`}
              className="btn btn-sm btn-light disabled"
            >
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={`btn btn-sm ${
                item === page ? "btn-primary" : "btn-light-primary"
              }`}
              onClick={() => onPage(Number(item))}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          className="btn btn-sm btn-light"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}