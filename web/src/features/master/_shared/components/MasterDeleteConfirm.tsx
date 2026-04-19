import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteMaster } from "../api/deleteMaster.api"
import { usePermission } from "@/core/rbac/usePermission"
import type { Permission } from "@/core/rbac/permissions"

interface Props {
  endpoint: string
  id: bigint
  title: string
  permissionDelete?: Permission
  onClose: () => void
}

export function MasterDeleteConfirm({
  endpoint,
  id,
  title,
  permissionDelete,
  onClose,
}: Props) {
  const hasPermission = usePermission()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteMaster(endpoint, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master", endpoint] })
      onClose()
    },
  })

  if (permissionDelete && !hasPermission(permissionDelete)) return null

  return (
    <div className="modal fade show d-block">
      <div className="modal-dialog modal-sm">
        <div className="modal-content">
          <div className="modal-body text-center">
            <p>
              Yakin hapus <strong>{title}</strong>?
            </p>

            <div className="d-flex justify-content-center gap-2 mt-4">
              <button
                className="btn btn-light"
                onClick={onClose}
              >
                Batal
              </button>

              <button
                className="btn btn-danger"
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
