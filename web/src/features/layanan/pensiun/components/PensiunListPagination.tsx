interface Props {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

export function PensiunListPagination({
  page,
  totalPages,
  onChange,
}: Props) {
  return (
    <div className="d-flex justify-content-end mt-5">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="btn btn-sm btn-light me-2"
      >
        Prev
      </button>

      <span>{page} / {totalPages}</span>

      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="btn btn-sm btn-light ms-2"
      >
        Next
      </button>
    </div>
  )
}