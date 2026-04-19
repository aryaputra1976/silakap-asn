import { MasterListPage } from "../_shared/pages/MasterListPage"
import { PERMISSIONS } from "@/core/rbac/permissions"
import type { MasterEntity } from "../_shared/types"

type UnitKerja = MasterEntity

export default function UnorPage() {
  return (
    <MasterListPage<UnitKerja>
      config={{
        title: "Unit Kerja",
        endpoint: "/master/unor",
        permissionView: PERMISSIONS.MASTER_UNOR_VIEW,
        permissionCreate: PERMISSIONS.MASTER_UNOR_CREATE,
        permissionUpdate: PERMISSIONS.MASTER_UNOR_UPDATE,
        permissionDelete: PERMISSIONS.MASTER_UNOR_DELETE,
      }}
    />
  )
}