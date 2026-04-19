import { MasterListPage } from "../_shared/pages/MasterListPage"
import { PERMISSIONS } from "@/core/rbac/permissions"
import type { MasterEntity } from "../_shared/types"

type JenisJabatan = MasterEntity

export default function JenisJabatanPage() {
  return (
    <MasterListPage<JenisJabatan>
      config={{
        title: "Jenis Jabatan",
        endpoint: "/master/jenis-jabatan",
        permissionView: PERMISSIONS.MASTER_JENIS_JABATAN_VIEW,
        permissionCreate: PERMISSIONS.MASTER_JENIS_JABATAN_CREATE,
        permissionUpdate: PERMISSIONS.MASTER_JENIS_JABATAN_UPDATE,
        permissionDelete: PERMISSIONS.MASTER_JENIS_JABATAN_DELETE,
      }}
    />
  )
}