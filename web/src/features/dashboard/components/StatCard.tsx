interface Props {
  title: string
  value: number
}

export function StatCard({ title, value }: Props) {
  return (
    <div className="card p-5 h-100">
      <div className="text-gray-500 fs-7">{title}</div>
      <div className="fs-2hx fw-bold">{value}</div>
    </div>
  )
}