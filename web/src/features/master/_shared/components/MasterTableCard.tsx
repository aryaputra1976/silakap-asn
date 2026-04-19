interface MasterTableCardProps<T> {
  data: T[]
  loading?: boolean
  renderItem: (item: T) => React.ReactNode
  emptyText?: string
}

export function MasterTableCard<T>({
  data,
  loading,
  renderItem,
  emptyText = "Data tidak tersedia",
}: MasterTableCardProps<T>) {
  if (loading) {
    return <div>Loading...</div>
  }

  if (!data || data.length === 0) {
    return (
      <div className="alert alert-light text-center">
        {emptyText}
      </div>
    )
  }

  return (
    <div className="row g-3">
      {data.map((item, index) => (
        <div key={index} className="col-md-6 col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              {renderItem(item)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}