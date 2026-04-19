import { MasterListPage } from "../_shared/pages/MasterListPage"
import { PERMISSIONS } from "@/core/rbac/permissions"
import type { MasterEntity } from "../_shared/types"

type TempatLahir = MasterEntity

export default function TempatLahirPage() {
  return (
    <MasterListPage<TempatLahir>
      config={{
        title: "Tempat Lahir",
        endpoint: "/master/tempat-lahir",
        permissionView: PERMISSIONS.MASTER_TEMPAT_LAHIR_VIEW,
        permissionCreate: PERMISSIONS.MASTER_TEMPAT_LAHIR_CREATE,
        permissionUpdate: PERMISSIONS.MASTER_TEMPAT_LAHIR_UPDATE,
        permissionDelete: PERMISSIONS.MASTER_TEMPAT_LAHIR_DELETE,
      }}
    />
  )
}