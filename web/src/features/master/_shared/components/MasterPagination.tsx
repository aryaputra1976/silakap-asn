type Props = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function MasterPagination({
  page,
  totalPages,
  onPageChange,
}: Props) {
  if (totalPages <= 1) return null

  const delta = 2
  const pages: (number | "...")[] = []

  const left = Math.max(1, page - delta)
  const right = Math.min(totalPages, page + delta)

  // Always show first page
  if (left > 1) {
    pages.push(1)
    if (left > 2) pages.push("...")
  }

  // Middle range
  for (let i = left; i <= right; i++) {
    pages.push(i)
  }

  // Always show last page
  if (right < totalPages) {
    if (right < totalPages - 1) pages.push("...")
    pages.push(totalPages)
  }

  return (
    <div className="d-flex justify-content-end mt-6">
      <ul className="pagination">

        {/* Previous */}
        <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(page - 1)}
          >
            «
          </button>
        </li>

        {pages.map((p, index) =>
          p === "..." ? (
            <li key={`dots-${index}`} className="page-item disabled">
              <span className="page-link">…</span>
            </li>
          ) : (
            <li
              key={p}
              className={`page-item ${p === page ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            </li>
          )
        )}

        {/* Next */}
        <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(page + 1)}
          >
            »
          </button>
        </li>
      </ul>
    </div>
  )
}