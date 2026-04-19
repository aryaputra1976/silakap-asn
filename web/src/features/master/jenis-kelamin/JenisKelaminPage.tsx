import { MasterListPage } from "../_shared/pages/MasterListPage"
import { PERMISSIONS } from "@/core/rbac/permissions"
import type { MasterEntity } from "../_shared/types"

type JenisKelamin = MasterEntity

export default function JenisKelaminPage() {
  return (
    <MasterListPage<JenisKelamin>
      config={{
        title: "Jenis Kelamin",
        endpoint: "/master/jenis-kelamin",
        permissionView: PERMISSIONS.MASTER_JENIS_KELAMIN_VIEW,
        permissionCreate: PERMISSIONS.MASTER_JENIS_KELAMIN_CREATE,
        permissionUpdate: PERMISSIONS.MASTER_JENIS_KELAMIN_UPDATE,
        permissionDelete: PERMISSIONS.MASTER_JENIS_KELAMIN_DELETE,
      }}
    />
  )
}