interface Props {
  page: number
  total: number
  limit: number
  onPage: (v: number) => void
}

function getPagination(current: number, total: number) {

  const delta = 2
  const range: number[] = []
  const rangeWithDots: (number | string)[] = []

  let last: number | undefined

  for (let i = 1; i <= total; i++) {

    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i)
    }

  }

  for (const i of range) {

    if (last !== undefined) {

      if (i - last === 2) {
        rangeWithDots.push(last + 1)
      } else if (i - last > 2) {
        rangeWithDots.push("...")
      }

    }

    rangeWithDots.push(i)
    last = i

  }

  return rangeWithDots
}

export function AsnPagination({
  page,
  total,
  limit,
  onPage
}: Props) {

  const totalPages = Math.max(1, Math.ceil(total / limit))

  const pages = getPagination(page, totalPages)

  const start = total === 0 ? 0 : (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  return (

    <div className="d-flex justify-content-between align-items-center mt-5">

      <div className="text-muted">

        {total === 0
          ? "Tidak ada data"
          : `Menampilkan ${start} - ${end} dari ${total} ASN`
        }

      </div>

      <div className="d-flex gap-2 align-items-center">

        {/* PREV */}

        <button
          type="button"
          className="btn btn-sm btn-light"
          disabled={page <= 1}
          onClick={() => onPage(Math.max(1, page - 1))}
        >
          Prev
        </button>

        {/* PAGES */}

        {pages.map((p, i) => {

          if (p === "...") {
            return (
              <span key={i} className="px-2 text-muted">
                ...
              </span>
            )
          }

          const n = Number(p)

          return (
            <button
              key={i}
              type="button"
              className={`btn btn-sm ${
                page === n ? "btn-primary" : "btn-light"
              }`}
              onClick={() => onPage(n)}
            >
              {n}
            </button>
          )

        })}

        {/* NEXT */}

        <button
          type="button"
          className="btn btn-sm btn-light"
          disabled={page >= totalPages}
          onClick={() => onPage(Math.min(totalPages, page + 1))}
        >
          Next
        </button>

      </div>

    </div>

  )

}