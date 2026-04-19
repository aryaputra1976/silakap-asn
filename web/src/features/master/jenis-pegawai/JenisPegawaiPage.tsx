import { MasterListPage } from "../_shared/pages/MasterListPage"
import { PERMISSIONS } from "@/core/rbac/permissions"
import type { MasterEntity } from "../_shared/types"

type JenisPegawai = MasterEntity

export default function JenisPegawaiPage() {
  return (
    <MasterListPage<JenisPegawai>
      config={{
        title: "Jenis Pegawai",
        endpoint: "/master/jenis-pegawai",
        permissionView: PERMISSIONS.MASTER_JENIS_PEGAWAI_VIEW,
        permissionCreate: PERMISSIONS.MASTER_JENIS_PEGAWAI_CREATE,
        permissionUpdate: PERMISSIONS.MASTER_JENIS_PEGAWAI_UPDATE,
        permissionDelete: PERMISSIONS.MASTER_JENIS_PEGAWAI_DELETE,
      }}
    />
  )
}