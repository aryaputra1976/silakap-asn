import { MasterListPage } from "../_shared/pages/MasterListPage"
import { PERMISSIONS } from "@/core/rbac/permissions"
import type { MasterEntity } from "../_shared/types"

type KedudukanHukum = MasterEntity

export default function KedudukanHukumPage() {
  return (
    <MasterListPage<KedudukanHukum>
      config={{
        title: "Kedudukan Hukum",
        endpoint: "/master/kedudukan-hukum",
        permissionView: PERMISSIONS.MASTER_KEDUDUKAN_HUKUM_VIEW,
        permissionCreate: PERMISSIONS.MASTER_KEDUDUKAN_HUKUM_CREATE,
        permissionUpdate: PERMISSIONS.MASTER_KEDUDUKAN_HUKUM_UPDATE,
        permissionDelete: PERMISSIONS.MASTER_KEDUDUKAN_HUKUM_DELETE,
      }}
    />
  )
}