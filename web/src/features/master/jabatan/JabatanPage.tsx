import { MasterListPage } from "../_shared/pages/MasterListPage"
import { PERMISSIONS } from "@/core/rbac/permissions"
import type { MasterEntity } from "../_shared/types"

type Jabatan = MasterEntity

export default function JabatanPage() {
  return (
    <MasterListPage<Jabatan>
      config={{
        title: "Jabatan",
        endpoint: "/master/jabatan",
        permissionView: PERMISSIONS.MASTER_JABATAN_VIEW,
        permissionCreate: PERMISSIONS.MASTER_JABATAN_CREATE,
        permissionUpdate: PERMISSIONS.MASTER_JABATAN_UPDATE,
        permissionDelete: PERMISSIONS.MASTER_JABATAN_DELETE,
      }}
    />
  )
}