import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { useConfirm } from "@/components/common/confirm/ConfirmProvider"
import { usePermission } from "@/core/rbac/usePermission"
import { PageTitle, type PageLink } from "@/_metronic/layout/core"

import { MasterToolbar } from "../components/MasterToolbar"
import { MasterTable } from "../components/MasterTable"
import { MasterPagination } from "../components/MasterPagination"
import { MasterFormModal } from "../components/MasterFormModal"

import { useMasterQuery } from "../hooks/useMasterQuery"
import { useCreateMasterMutation } from "../hooks/useCreateMasterMutation"
import { useUpdateMasterMutation } from "../hooks/useUpdateMasterMutation"
import { useDeleteMasterMutation } from "../hooks/useDeleteMasterMutation"
import { useToggleMaster } from "../hooks/useToggleMaster"

import type {
  MasterEntity,
  MasterQueryParams,
  CreateMasterPayload,
  UpdateMasterPayload,
  MasterColumn,
} from "../types"

import type { Permission } from "@/core/rbac/permissions"

type Config<T extends MasterEntity> = {
  title: string
  endpoint: string
  columns?: MasterColumn<T>[]

  permissionView?: Permission
  permissionCreate?: Permission
  permissionUpdate?: Permission
  permissionDelete?: Permission
}

type ReferenceContext = {
  hubTitle: string
  hubPath: string
  scopeLabel: string
  description: string
}

const ASN_REFERENCE_ENDPOINTS = new Set([
  "/master/jenis-kelamin",
  "/master/status-kepegawaian",
  "/master/jenis-pegawai",
  "/master/status-perkawinan",
  "/master/agama",
  "/master/tempat-lahir",
  "/master/pendidikan",
  "/master/pendidikan-tingkat",
  "/master/jabatan",
  "/master/jenis-jabatan",
  "/master/golongan",
  "/master/kedudukan-hukum",
])

const ORGANIZATION_REFERENCE_ENDPOINTS = new Set([
  "/master/unor",
  "/master/satker",
  "/master/instansi",
  "/master/lokasi-kerja",
  "/master/kpkn",
])

const DOCUMENT_REFERENCE_ENDPOINTS = new Set([
  "/master/jenis-layanan",
  "/master/jenis-pensiun",
  "/master/alasan-pensiun",
])

function resolveReferenceHub(endpoint: string): PageLink | null {
  if (ASN_REFERENCE_ENDPOINTS.has(endpoint)) {
    return {
      title: "Referensi ASN",
      path: "/referensi/asn",
      isActive: false,
    }
  }

  if (ORGANIZATION_REFERENCE_ENDPOINTS.has(endpoint)) {
    return {
      title: "Referensi Organisasi",
      path: "/referensi/organisasi",
      isActive: false,
    }
  }

  if (DOCUMENT_REFERENCE_ENDPOINTS.has(endpoint)) {
    return {
      title: "Referensi Dokumen",
      path: "/referensi/dokumen",
      isActive: false,
    }
  }

  return null
}

function resolveReferenceContext(endpoint: string): ReferenceContext | null {
  if (ASN_REFERENCE_ENDPOINTS.has(endpoint)) {
    return {
      hubTitle: "Referensi ASN",
      hubPath: "/referensi/asn",
      scopeLabel: "Identitas dan Karier ASN",
      description:
        "Master ini dipakai lintas profil ASN, layanan, validasi data, dan laporan pegawai.",
    }
  }

  if (ORGANIZATION_REFERENCE_ENDPOINTS.has(endpoint)) {
    return {
      hubTitle: "Referensi Organisasi",
      hubPath: "/referensi/organisasi",
      scopeLabel: "Struktur Organisasi",
      description:
        "Master ini menopang unit organisasi, instansi, lokasi kerja, dan pembatasan scope data.",
    }
  }

  if (DOCUMENT_REFERENCE_ENDPOINTS.has(endpoint)) {
    return {
      hubTitle: "Referensi Dokumen",
      hubPath: "/referensi/dokumen",
      scopeLabel: "Layanan dan Dokumen",
      description:
        "Master ini menjadi fondasi klasifikasi layanan, normalisasi domain, dan validasi dokumen usulan.",
    }
  }

  return null
}

export function MasterListPage<T extends MasterEntity>({
  config,
}: {
  config: Config<T>
}) {
  const confirm = useConfirm()

  // ================= PERMISSION =================
  const checkPermission = usePermission()

  const canView = checkPermission(config.permissionView)
  const canCreate = checkPermission(config.permissionCreate)
  const canUpdate = checkPermission(config.permissionUpdate)
  const canDelete = checkPermission(config.permissionDelete)

  // ================= STATE =================
  const [params, setParams] = useState<MasterQueryParams>({
    page: 1,
    limit: 10,
    search: "",
    sort: "kode",
    order: "asc",
    status: undefined,
  })

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [togglingId, setTogglingId] = useState<bigint | null>(null)

  // ================= INTERNAL COLUMNS =================
const defaultColumns: MasterColumn<T>[] = [
  { key: "kode", title: "Kode", sortable: true },
  { key: "nama", title: "Nama", sortable: true },
  {
    key: "isActive",
    title: "Status",
    sortable: true,
    render: (item: any) => (
      <span
        className={`badge ${
          item.isActive
            ? "badge-light-success"
            : "badge-light-danger"
        }`}
      >
        {item.isActive ? "Aktif" : "Nonaktif"}
      </span>
    ),
  },
]

  // ================= CLEAN PARAMS =================
  const cleanedParams = useMemo(() => {
    const { status, search, ...rest } = params
    return {
      ...rest,
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
    }
  }, [params])

  // ================= QUERY =================
  const query = useMasterQuery<T>(config.endpoint, cleanedParams)

  // ================= MUTATIONS =================
  const createMutation = useCreateMasterMutation(config.endpoint)
  const updateMutation = useUpdateMasterMutation(config.endpoint)
  const deleteMutation = useDeleteMasterMutation(config.endpoint)
  const toggleMutation = useToggleMaster(config.endpoint)

  // ================= HANDLERS =================
  const handleSubmit = async (
    data: CreateMasterPayload | UpdateMasterPayload
  ) => {
    if (editing) {
      await updateMutation.mutateAsync({
        id: editing.id,
        payload: data as UpdateMasterPayload,
      })
    } else {
      const createData = data as CreateMasterPayload
      await createMutation.mutateAsync(createData)
    }

    setShowForm(false)
    setEditing(null)
  }

  const handleDelete = (item: T) => {
    confirm({
      title: "Hapus Data",
      message: `Yakin hapus "${item.nama}"?`,
      confirmText: "Ya, Hapus",
      onConfirm: () => deleteMutation.mutate(item.id),
    })
  }

  const handleToggleActive = async (item: T) => {
    setTogglingId(item.id)
    await toggleMutation.mutateAsync(item.id)
    setTogglingId(null)
  }

  const handleSort = (key: string) => {
    setParams((prev) => ({
      ...prev,
      page: 1,
      sort: key,
      order:
        prev.sort === key && prev.order === "asc"
          ? "desc"
          : "asc",
    }))
  }

  const total = query.data?.meta.total ?? 0
  const start = total === 0 ? 0 : (params.page - 1) * params.limit + 1
  const end = Math.min(params.page * params.limit, total)
  const referenceHub = resolveReferenceHub(config.endpoint)
  const referenceContext = resolveReferenceContext(config.endpoint)
  const breadcrumbs: Array<PageLink> = [
    { title: "Dashboard", path: "/dashboard", isActive: false },
    { title: "Master Referensi", path: "#", isActive: false },
    ...(referenceHub ? [referenceHub] : []),
  ]

  if (!canView) {
    return <div className="card-body">Tidak memiliki akses.</div>
  }

  return (
    <>
      <PageTitle breadcrumbs={breadcrumbs}>{config.title}</PageTitle>

      {referenceContext ? (
        <div className="card border-0 shadow-sm mb-7 overflow-hidden">
          <div
            className="card-body p-6 p-lg-8"
            style={{
              background:
                "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
            }}
          >
            <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-5">
              <div>
                <div className="d-inline-flex align-items-center rounded-pill bg-light-primary text-primary fw-bold fs-8 px-4 py-2 mb-4">
                  {referenceContext.scopeLabel}
                </div>
                <div className="fw-bolder fs-2 text-gray-900 mb-3">
                  {config.title}
                </div>
                <div className="text-gray-600 fs-6 lh-lg">
                  {referenceContext.description}
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 flex-shrink-0">
                <div className="text-end">
                  <div className="text-gray-500 fs-8 fw-semibold text-uppercase">
                    Kelompok
                  </div>
                  <div className="fw-bold text-gray-900 fs-6">
                    {referenceContext.hubTitle}
                  </div>
                </div>
                <Link
                  to={referenceContext.hubPath}
                  className="btn btn-light-primary"
                >
                  Kembali ke Hub
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="card card-flush">

        <MasterToolbar
          title={config.title}
          search={params.search ?? ""}
          status={params.status}
          canCreate={canCreate}
          onSearchChange={(value) =>
            setParams((p) => ({ ...p, search: value, page: 1 }))
          }
          onStatusChange={(value) =>
            setParams((p) => ({
              ...p,
              status: value === "" ? undefined : value,
              page: 1,
            }))
          }
          onCreate={() => {
            setEditing(null)
            setShowForm(true)
          }}
        />

        <div className="card-body pt-0">

          <div className="d-flex justify-content-between align-items-center mb-5">
            <div className="text-gray-600 fs-7">
              {total > 0 ? (
                <>
                  Menampilkan <strong>{start}</strong> –{" "}
                  <strong>{end}</strong> dari{" "}
                  <strong>{total}</strong> data
                </>
              ) : (
                <>Belum ada data</>
              )}
            </div>
          </div>

          <MasterTable
            data={query.data?.data ?? []}
            columns={config.columns ?? defaultColumns}
            loading={query.isLoading}
            sort={params.sort}
            order={params.order}
            canEdit={canUpdate}
            canDelete={canDelete}
            onSortChange={handleSort}
            onEdit={(item) => {
              setEditing(item)
              setShowForm(true)
            }}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
            togglingId={togglingId}
          />

          {total > 0 && (
            <MasterPagination
              page={params.page}
              totalPages={Math.ceil(total / params.limit)}
              onPageChange={(page) =>
                setParams((p) => ({ ...p, page }))
              }
            />
          )}
        </div>
      </div>

      <MasterFormModal
        show={showForm}
        canCreate={canCreate}
        canUpdate={canUpdate}
        onClose={() => {
          setShowForm(false)
          setEditing(null)
        }}
        onSubmit={handleSubmit}
        initialData={editing ?? undefined}
        loading={
          createMutation.isPending ||
          updateMutation.isPending
        }
        title={config.title}
      />
    </>
  )
}
