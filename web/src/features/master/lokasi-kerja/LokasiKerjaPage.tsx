import { MasterListPage } from "../_shared/pages/MasterListPage"
import { PERMISSIONS } from "@/core/rbac/permissions"
import type { MasterEntity } from "../_shared/types"

type LokasiKerja = MasterEntity

export default function LokasiKerjaPage() {
  return (
    <MasterListPage<LokasiKerja>
      config={{
        title: "Lokasi Kerja",
        endpoint: "/master/lokasi-kerja",
        permissionView: PERMISSIONS.MASTER_LOKASI_KERJA_VIEW,
        permissionCreate: PERMISSIONS.MASTER_LOKASI_KERJA_CREATE,
        permissionUpdate: PERMISSIONS.MASTER_LOKASI_KERJA_UPDATE,
        permissionDelete: PERMISSIONS.MASTER_LOKASI_KERJA_DELETE,
      }}
    />
  )
}