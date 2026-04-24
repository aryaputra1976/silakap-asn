import { useNavigate, useParams, Navigate } from "react-router-dom"

import { getService } from "../../registry"
import { useCreateService } from "../hooks/useCreateService"
import { uploadDocument } from "../../documents/api/document.api"

export default function ServiceCreatePage() {

  const { service } = useParams<{ service: string }>()
  const navigate = useNavigate()

  if (!service) {
    return <Navigate to="/dashboard" replace />
  }

  const serviceCode: string = service

  const config = getService(serviceCode)
  const { create, loading } = useCreateService(serviceCode)

  if (!config) {
    return <Navigate to="/dashboard" replace />
  }

  const FormComponent = config.form

  if (!FormComponent) {
    return (
      <div className="alert alert-warning">
        Form belum tersedia untuk layanan ini
      </div>
    )
  }

  async function handleSubmit(data: any) {
    const {
      documents,
      ...payload
    } = data ?? {}

    try {
      const result: any = await create(payload)
      const usulId = result?.usulId ? String(result.usulId) : null

      if (usulId && documents && typeof documents === "object") {
        for (const [key, file] of Object.entries(documents)) {
          if (!(file instanceof File)) {
            continue
          }

          await uploadDocument(serviceCode, usulId, key, file)
        }
      }

      if (usulId) {
        navigate(`/layanan/${serviceCode}/${usulId}`)
        return
      }

      navigate(`/layanan/${serviceCode}/list`)

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
