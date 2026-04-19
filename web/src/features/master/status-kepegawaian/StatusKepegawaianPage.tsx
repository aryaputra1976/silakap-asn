import { MasterListPage } from "../_shared/pages/MasterListPage"
import { PERMISSIONS } from "@/core/rbac/permissions"
import type { MasterEntity } from "../_shared/types"

type StatusKepegawaian = MasterEntity

export default function StatusKepegawaianPage() {
  return (
    <MasterListPage<StatusKepegawaian>
      config={{
        title: "Status Kepegawaian",
        endpoint: "/master/status-kepegawaian",
        permissionView: PERMISSIONS.MASTER_STATUS_KEPEGAWAIAN_VIEW,
        permissionCreate: PERMISSIONS.MASTER_STATUS_KEPEGAWAIAN_CREATE,
        permissionUpdate: PERMISSIONS.MASTER_STATUS_KEPEGAWAIAN_UPDATE,
        permissionDelete: PERMISSIONS.MASTER_STATUS_KEPEGAWAIAN_DELETE,
      }}
    />
  )
}