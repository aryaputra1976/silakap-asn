import { MasterListPage } from "../_shared/pages/MasterListPage"
import { PERMISSIONS } from "@/core/rbac/permissions"
import type { MasterEntity } from "../_shared/types"

type Pendidikan = MasterEntity

export default function PendidikanPage() {
  return (
    <MasterListPage<Pendidikan>
      config={{
        title: "Pendidikan",
        endpoint: "/master/pendidikan",
        permissionView: PERMISSIONS.MASTER_PENDIDIKAN_VIEW,
        permissionCreate: PERMISSIONS.MASTER_PENDIDIKAN_CREATE,
        permissionUpdate: PERMISSIONS.MASTER_PENDIDIKAN_UPDATE,
        permissionDelete: PERMISSIONS.MASTER_PENDIDIKAN_DELETE,
      }}
    />
  )
}