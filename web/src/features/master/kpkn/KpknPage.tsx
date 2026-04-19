import { MasterListPage } from "../_shared/pages/MasterListPage"
import { PERMISSIONS } from "@/core/rbac/permissions"
import type { MasterEntity } from "../_shared/types"

type Kpkn = MasterEntity

export default function KpknPage() {
  return (
    <MasterListPage<Kpkn>
      config={{
        title: "KPKN",
        endpoint: "/master/kpkn",
        permissionView: PERMISSIONS.MASTER_KPKN_VIEW,
        permissionCreate: PERMISSIONS.MASTER_KPKN_CREATE,
        permissionUpdate: PERMISSIONS.MASTER_KPKN_UPDATE,
        permissionDelete: PERMISSIONS.MASTER_KPKN_DELETE,
      }}
    />
  )
}