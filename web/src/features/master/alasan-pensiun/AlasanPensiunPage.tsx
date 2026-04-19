import { MasterListPage } from "../_shared/pages/MasterListPage"
import { PERMISSIONS } from "@/core/rbac/permissions"
import type { MasterEntity } from "../_shared/types"

type AlasanPensiun = MasterEntity

export default function AlasanPensiunPage() {
  return (
    <MasterListPage<AlasanPensiun>
      config={{
        title: "Alasan Pensiun",
        endpoint: "/master/alasan-pensiun",
        permissionView: PERMISSIONS.MASTER_ALASAN_PENSIUN_VIEW,
        permissionCreate: PERMISSIONS.MASTER_ALASAN_PENSIUN_CREATE,
        permissionUpdate: PERMISSIONS.MASTER_ALASAN_PENSIUN_UPDATE,
        permissionDelete: PERMISSIONS.MASTER_ALASAN_PENSIUN_DELETE,
      }}
    />
  )
}