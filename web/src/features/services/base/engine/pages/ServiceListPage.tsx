import { useParams, useNavigate, Navigate } from "react-router-dom"

import ServiceTable from "../../components/ServiceTable"
import { useServiceList } from "../hooks/useServiceList"
import { getService } from "../../registry"

export default function ServiceListPage() {

  const { service } = useParams<{ service: string }>()
  const navigate = useNavigate()

  if (!service) {
    return <Navigate to="/dashboard" replace />
  }

  const config = getService(service)
  const { data, loading } = useServiceList(
    service,
    Boolean(config),
  )

  if (!config) {
    return <Navigate to="/dashboard" replace />
  }

  return (

    <div className="card">

      <div className="card-header d-flex justify-content-between align-items-center">

        <h3 className="mb-0">{config.name}</h3>

        <button
          className="btn btn-primary"
          onClick={() => navigate(`/layanan/${service}/create`)}
        >
          + Buat Usulan
        </button>

      </div>

      <div className="card-body">

        <ServiceTable
          data={data ?? []}
          loading={loading}
          onDetail={(id: string) =>
            navigate(`/layanan/${service}/${id}`)
          }
        />

      </div>

    </div>

  )
}
