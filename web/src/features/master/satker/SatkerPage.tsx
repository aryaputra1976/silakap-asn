import { MasterListPage } from "../_shared/pages/MasterListPage"
import { PERMISSIONS } from "@/core/rbac/permissions"
import type { MasterEntity } from "../_shared/types"

type Satker = MasterEntity

export default function SatkerPage() {
  return (
    <MasterListPage<Satker>
      config={{
        title: "Satker",
        endpoint: "/master/satker",
        permissionView: PERMISSIONS.MASTER_SATKER_VIEW,
        permissionCreate: PERMISSIONS.MASTER_SATKER_CREATE,
        permissionUpdate: PERMISSIONS.MASTER_SATKER_UPDATE,
        permissionDelete: PERMISSIONS.MASTER_SATKER_DELETE,
      }}
    />
  )
}