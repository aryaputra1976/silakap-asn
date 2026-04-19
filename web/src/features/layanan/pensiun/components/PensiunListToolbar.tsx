interface Props {
  onFilter: (status: string) => void
  onCreate: () => void
}

export function PensiunListToolbar({
  onFilter,
  onCreate,
}: Props) {
  return (
    <div className="d-flex justify-content-between mb-5">
      <select
        className="form-select w-200px"
        onChange={(e) => onFilter(e.target.value)}
      >
        <option value="">Semua Status</option>
        <option value="DRAFT">Draft</option>
        <option value="SUBMITTED">Submitted</option>
        <option value="RETURNED">Returned</option>
        <option value="VERIFIED">Verified</option>
      </select>

      <button
        className="btn btn-primary"
        onClick={onCreate}
      >
        + Buat Usulan
      </button>
    </div>
  )
}