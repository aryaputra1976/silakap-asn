import { MasterListPage } from "../_shared/pages/MasterListPage"
import { PERMISSIONS } from "@/core/rbac/permissions"
import type { MasterEntity } from "../_shared/types"

type StatusPerkawinan = MasterEntity

export default function StatusPerkawinanPage() {
  return (
    <MasterListPage<StatusPerkawinan>
      config={{
        title: "Status Perkawinan",
        endpoint: "/master/status-perkawinan",
        permissionView: PERMISSIONS.MASTER_STATUS_PERKAWINAN_VIEW,
        permissionCreate: PERMISSIONS.MASTER_STATUS_PERKAWINAN_CREATE,
        permissionUpdate: PERMISSIONS.MASTER_STATUS_PERKAWINAN_UPDATE,
        permissionDelete: PERMISSIONS.MASTER_STATUS_PERKAWINAN_DELETE,
      }}
    />
  )
}