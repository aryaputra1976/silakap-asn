import { MasterListPage } from "../_shared/pages/MasterListPage"
import { PERMISSIONS } from "@/core/rbac/permissions"
import type { MasterEntity } from "../_shared/types"

type PendidikanTingkat = MasterEntity

export default function PendidikanTingkatPage() {
  return (
    <MasterListPage<PendidikanTingkat>
      config={{
        title: "Pendidikan Tingkat",
        endpoint: "/master/pendidikan-tingkat",
        permissionView: PERMISSIONS.MASTER_PENDIDIKAN_TINGKAT_VIEW,
        permissionCreate: PERMISSIONS.MASTER_PENDIDIKAN_TINGKAT_CREATE,
        permissionUpdate: PERMISSIONS.MASTER_PENDIDIKAN_TINGKAT_UPDATE,
        permissionDelete: PERMISSIONS.MASTER_PENDIDIKAN_TINGKAT_DELETE,
      }}
    />
  )
}