import { useParams, Navigate } from "react-router-dom"
import { useAuthStore } from "@/stores/auth.store"

import { useServiceDetail } from "../hooks/useServiceDetail"

import WorkflowActions from "../../workflow/WorkflowActions"
import { workflowDispatcher } from "../../workflow/workflow.dispatcher"
import { UserRole } from "../../workflow/role.config"

import DocumentList from "../../documents/components/DocumentList"
import { getServiceDocuments } from "../../documents/document.engine"

import ServiceTimeline from "../../components/ServiceTimeline"

export default function ServiceDetailPage() {

  const params = useParams<{ service: string; id: string }>()

  if (!params.service || !params.id) {
    return <Navigate to="/dashboard" replace />
  }

  // setelah guard ini TypeScript pasti tahu string
  const service: string = params.service
  const id: string = params.id

  const { data, loading, reload } = useServiceDetail(service, id)
  const authRoles = useAuthStore((state) => state.user?.roles ?? [])

  if (loading) {
    return (
      <div className="text-center py-10">
        Memuat data...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="alert alert-warning">
        Data tidak ditemukan
      </div>
    )
  }

  const detail = data

  const normalizedRoles = authRoles.map((role) =>
    role.toUpperCase()
  )

  const userRole: UserRole =
    normalizedRoles.includes("SUPER_ADMIN")
      ? "SUPER_ADMIN"
      : normalizedRoles.includes("ADMIN_BKPSDM")
        ? "ADMIN_BKPSDM"
        : normalizedRoles.includes("PPK")
          ? "PPK"
          : normalizedRoles.includes("OPERATOR")
            ? "OPERATOR"
            : normalizedRoles.includes("ASN")
              ? "ASN"
        : normalizedRoles.includes("VERIFIKATOR")
          ? "VERIFIKATOR"
          : "ASN"

  async function handleAction(action: string) {

    try {

      await workflowDispatcher(service, detail.id, action)

      alert("Aksi berhasil")

      await reload()

    } catch (err) {

      console.error(err)

      alert("Aksi gagal")

    }

  }

  const documents = getServiceDocuments(service)

  return (

    <div className="container-fluid">

      <div className="card mb-5">

        <div className="card-header d-flex justify-content-between align-items-center">

          <h3 className="mb-0">Detail Layanan</h3>

          <WorkflowActions
            status={detail.status}
            role={userRole}
            onAction={handleAction}
          />

        </div>

      </div>

      <div className="row">

        <div className="col-lg-8">

          <div className="card mb-5">

            <div className="card-header">
              <h4 className="mb-0">Dokumen</h4>
            </div>

            <div className="card-body">

              <DocumentList
                configs={documents}
                service={service}
                id={id}
              />

            </div>

          </div>

        </div>

        <div className="col-lg-4">

          <div className="card">

            <div className="card-header">
              <h4 className="mb-0">Timeline Proses</h4>
            </div>

            <div className="card-body">

              <ServiceTimeline
                timeline={detail.timeline ?? []}
              />

            </div>

          </div>

        </div>

      </div>

    </div>

  )

}
