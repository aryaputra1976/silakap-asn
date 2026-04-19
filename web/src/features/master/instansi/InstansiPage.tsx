import { MasterListPage } from "../_shared/pages/MasterListPage"
import { PERMISSIONS } from "@/core/rbac/permissions"
import type { MasterEntity } from "../_shared/types"

type Instansi = MasterEntity

export default function InstansiPage() {
  return (
    <MasterListPage<Instansi>
      config={{
        title: "Instansi",
        endpoint: "/master/instansi",
        permissionView: PERMISSIONS.MASTER_INSTANSI_VIEW,
        permissionCreate: PERMISSIONS.MASTER_INSTANSI_CREATE,
        permissionUpdate: PERMISSIONS.MASTER_INSTANSI_UPDATE,
        permissionDelete: PERMISSIONS.MASTER_INSTANSI_DELETE,
      }}
    />
  )
}