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
  const pages: Array<number | "..."> = []

  const left = Math.max(1, page - delta)
  const right = Math.min(totalPages, page + delta)

  if (left > 1) {
    pages.push(1)
    if (left > 2) pages.push("...")
  }

  for (let i = left; i <= right; i++) {
    pages.push(i)
  }

  if (right < totalPages) {
    if (right < totalPages - 1) pages.push("...")
    pages.push(totalPages)
  }

  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4 mt-6">
      <div className="text-gray-600 fs-7">
        Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong>
      </div>

      <ul className="pagination mb-0">
        <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(page - 1)}
          >
            &laquo;
          </button>
        </li>

        {pages.map((p, index) =>
          p === "..." ? (
            <li key={`dots-${index}`} className="page-item disabled">
              <span className="page-link">&hellip;</span>
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

        <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(page + 1)}
          >
            &raquo;
          </button>
        </li>
      </ul>
    </div>
  )
}
