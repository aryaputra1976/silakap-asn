import { MasterListPage } from "../_shared/pages/MasterListPage"
import { PERMISSIONS } from "@/core/rbac/permissions"
import type { MasterEntity } from "../_shared/types"

/**
 * Karena Golongan mengikuti struktur master standar:
 * id, kode, nama, isActive
 * maka cukup pakai MasterEntity
 */
type Golongan = MasterEntity

export default function GolonganPage() {
  return (
    <MasterListPage<Golongan>
      config={{
        title: "Golongan",
        endpoint: "/master/golongan",

        permissionView: PERMISSIONS.MASTER_GOLONGAN_VIEW,
        permissionCreate: PERMISSIONS.MASTER_GOLONGAN_CREATE,
        permissionUpdate: PERMISSIONS.MASTER_GOLONGAN_UPDATE,
        permissionDelete: PERMISSIONS.MASTER_GOLONGAN_DELETE,
      }}
    />
  )
}