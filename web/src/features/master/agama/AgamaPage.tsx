import { MasterListPage } from "../_shared/pages/MasterListPage"
import { PERMISSIONS } from "@/core/rbac/permissions"
import type { MasterEntity } from "../_shared/types"

type Agama = MasterEntity

export default function AgamaPage() {
  return (
    <MasterListPage<Agama>
      config={{
        title: "Agama",
        endpoint: "/master/agama",
        permissionView: PERMISSIONS.MASTER_AGAMA_VIEW,
        permissionCreate: PERMISSIONS.MASTER_AGAMA_CREATE,
        permissionUpdate: PERMISSIONS.MASTER_AGAMA_UPDATE,
        permissionDelete: PERMISSIONS.MASTER_AGAMA_DELETE,
      }}
    />
  )
}