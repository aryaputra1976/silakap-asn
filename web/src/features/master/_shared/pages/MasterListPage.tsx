import { useState, useMemo } from "react"
import { useConfirm } from "@/components/common/confirm/ConfirmProvider"
import { usePermission } from "@/core/rbac/usePermission"

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

  if (!canView) {
    return <div className="card-body">Tidak memiliki akses.</div>
  }

  return (
    <>
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