import { MasterListPage } from "../_shared/pages/MasterListPage"
import { PERMISSIONS } from "@/core/rbac/permissions"
import type { MasterEntity } from "../_shared/types"

type JenisPensiun = MasterEntity

export default function JenisPensiunPage() {
  return (
    <MasterListPage<JenisPensiun>
      config={{
        title: "Jenis Pensiun",
        endpoint: "/master/jenis-pensiun",
        permissionView: PERMISSIONS.MASTER_JENIS_PENSIUN_VIEW,
        permissionCreate: PERMISSIONS.MASTER_JENIS_PENSIUN_CREATE,
        permissionUpdate: PERMISSIONS.MASTER_JENIS_PENSIUN_UPDATE,
        permissionDelete: PERMISSIONS.MASTER_JENIS_PENSIUN_DELETE,
      }}
    />
  )
}