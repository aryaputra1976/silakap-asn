import { useParams, Navigate } from "react-router-dom"

import { getService } from "../../registry"
import { useCreateService } from "../hooks/useCreateService"

export default function ServiceCreatePage() {

  const { service } = useParams<{ service: string }>()

  if (!service) {
    return <Navigate to="/dashboard" replace />
  }

  const config = getService(service)

  if (!config) {
    return (
      <div className="alert alert-danger">
        Service tidak terdaftar
      </div>
    )
  }

  const { create, loading } = useCreateService(service)

  const FormComponent = config.form

  if (!FormComponent) {
    return (
      <div className="alert alert-warning">
        Form belum tersedia untuk layanan ini
      </div>
    )
  }

  async function handleSubmit(data: any) {

    try {

      await create(data)

    } catch (error) {

      console.error("Gagal membuat usulan", error)

    }

  }

  return (

    <div className="card">

      <div className="card-header">
        <h3 className="mb-0">{config.name}</h3>
      </div>

      <div className="card-body">

        <FormComponent
          onSubmit={handleSubmit}
          loading={loading}
        />

      </div>

    </div>

  )

}