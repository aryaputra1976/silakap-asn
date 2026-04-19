import UnorTree from "../components/UnorTree"
import UnorStats from "../components/UnorStats"
import UnorBreadcrumb from "../components/UnorBreadcrumb"
import ExplorerToolbar from "../components/ExplorerToolbar"

import { useExplorerState } from "../hooks/useExplorerState"

import { AsnTable } from "@/features/profil-asn/components/AsnTable"
import { useAsnList } from "@/features/profil-asn/hooks/useAsnList"

export default function AsnExplorerPage() {

  const explorer = useExplorerState()

    const { data, loading } = useAsnList({
    search: explorer.search,
    unorId: explorer.unitId,
    page: explorer.page
    })

  return (

    <div className="row">

      <div className="col-12 mb-5">

        <ExplorerToolbar
          search={explorer.search}
          setSearch={explorer.setSearch}
        />

      </div>

      <div className="col-3">

        <UnorTree
          onSelect={(u:any) => explorer.setUnitId(u.id)}
        />

      </div>

      <div className="col-9">

        <UnorBreadcrumb unitId={explorer.unitId} />

        <UnorStats unitId={explorer.unitId} />

        <AsnTable
          data={data}
          loading={loading}
        />

      </div>

    </div>

  )

}