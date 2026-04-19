import { MasterListPage } from "../_shared/pages/MasterListPage"
import { PERMISSIONS } from "@/core/rbac/permissions"
import type { MasterEntity } from "../_shared/types"

type JenisLayanan = MasterEntity

export default function JenisLayananPage() {
  return (
    <MasterListPage<JenisLayanan>
      config={{
        title: "Jenis Layanan",
        endpoint: "/master/jenis-layanan",
        permissionView: PERMISSIONS.MASTER_JENIS_LAYANAN_VIEW,
        permissionCreate: PERMISSIONS.MASTER_JENIS_LAYANAN_CREATE,
        permissionUpdate: PERMISSIONS.MASTER_JENIS_LAYANAN_UPDATE,
        permissionDelete: PERMISSIONS.MASTER_JENIS_LAYANAN_DELETE,
      }}
    />
  )
}