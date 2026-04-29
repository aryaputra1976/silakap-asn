import { Link, Navigate, useNavigate, useParams } from "react-router-dom"

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
  const isPeremajaan = serviceCode === "peremajaan"

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

  if (isPeremajaan) {
    return (
      <div className="container-fluid">
        <div
          className="card border-0 shadow-sm mb-6"
          style={{
            background:
              "linear-gradient(90deg, #2754d7 0%, #0f214f 55%, #091531 100%)",
          }}
        >
          <div className="card-body p-6 p-lg-7">
            <div className="d-flex flex-column flex-xl-row align-items-xl-center justify-content-between gap-5">
              <div className="flex-grow-1">
                <h1 className="text-white fw-bolder mb-3">
                  Peremajaan Data ASN
                </h1>

                <div className="text-white opacity-75 fs-5 fw-semibold mb-5">
                  Ajukan koreksi atau pembaruan data identitas pegawai melalui
                  alur layanan yang terdokumentasi.
                </div>

                <div
                  className="rounded-4 border p-4"
                  style={{
                    background: "rgba(7, 19, 53, 0.28)",
                    borderColor: "rgba(255,255,255,0.16)",
                  }}
                >
                  <div className="text-white fw-bold fs-5 mb-3">
                    Area ini dipakai untuk menjaga perubahan data ASN tetap
                    konsisten, tervalidasi, dan siap diaudit.
                  </div>

                  <div className="d-flex flex-wrap gap-3">
                    <span className="badge badge-light-primary text-primary fw-bold fs-8 px-4 py-2">
                      Identitas ASN
                    </span>
                    <span className="badge badge-light-success text-success fw-bold fs-8 px-4 py-2">
                      Dokumen Pendukung
                    </span>
                    <span className="badge badge-light-warning text-warning fw-bold fs-8 px-4 py-2">
                      Workflow Approval
                    </span>
                  </div>
                </div>
              </div>

              <div className="d-flex flex-column flex-sm-row flex-xl-column gap-3">
                <Link
                  to="/layanan/peremajaan"
                  className="btn btn-light-primary"
                >
                  Dashboard
                </Link>
                <Link
                  to="/layanan/peremajaan/list"
                  className="btn btn-primary"
                >
                  Lihat Daftar
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-header align-items-center border-0 pt-6">
            <div className="card-title">
              <div className="d-flex flex-column">
                <span className="fs-2 fw-bolder text-gray-900">
                  Form Usulan Peremajaan
                </span>
                <span className="text-muted fs-7">
                  Lengkapi data perubahan dan unggah dokumen persyaratan.
                </span>
              </div>
            </div>
          </div>

          <div className="card-body pt-2 pb-8">
            <FormComponent
              onSubmit={handleSubmit}
              loading={loading}
            />
          </div>
        </div>
      </div>
    )
  }

  return (

    <div className="card">

      <div className="card-header border-0 pt-6">
        <div>
          <h3 className="card-title fw-bold text-gray-900">
            {config.name}
          </h3>
          {config.description ? (
            <div className="text-muted fs-7">
              {config.description}
            </div>
          ) : null}
        </div>
      </div>

      <div className="card-body pt-2">

        <FormComponent
          onSubmit={handleSubmit}
          loading={loading}
        />

      </div>

    </div>

  )

}
