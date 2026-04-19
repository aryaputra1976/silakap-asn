import { useUnorBreadcrumb } from "../hooks/useUnorBreadcrumb"

export default function UnorBreadcrumb({ unitId }: any) {

  const path = useUnorBreadcrumb(unitId)

  if (!path.length) return null

  return (

    <div className="mb-5">

      {path.map((p, i) => (

        <span key={p.id}>

          {p.nama}

          {i < path.length - 1 && " → "}

        </span>

      ))}

    </div>

  )

}