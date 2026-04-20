import UnorTree from "../components/UnorTree"
import UnorStats from "../components/UnorStats"
import UnorBreadcrumb from "../components/UnorBreadcrumb"
import ExplorerToolbar from "../components/ExplorerToolbar"

import { useExplorerState } from "../hooks/useExplorerState"
import { useOperatorOpdScope } from "@/features/auth/hooks/useOperatorOpdScope"

import { AsnTable } from "@/features/profil-asn/components/AsnTable"
import { useAsnList } from "@/features/profil-asn/hooks/useAsnList"

export default function AsnExplorerPage() {
  const scope = useOperatorOpdScope()
  const explorer = useExplorerState()

  const effectiveUnorId = scope.isOperatorScoped
    ? scope.unorId
    : explorer.unitId

  const { data, loading } = useAsnList({
    search: explorer.search,
    unorId: effectiveUnorId,
    page: explorer.page
  })

  if (scope.loading) {
    return <div className="card p-10 text-center">Menyiapkan explorer ASN OPD...</div>
  }

  return (

    <div className="row">

      <div className="col-12 mb-5">

        <ExplorerToolbar
          search={explorer.search}
          setSearch={explorer.setSearch}
        />

      </div>

      {!scope.isOperatorScoped && (
        <div className="col-3">

          <UnorTree
            onSelect={(u:any) => explorer.setUnitId(u.id)}
          />

        </div>
      )}

      <div className={scope.isOperatorScoped ? "col-12" : "col-9"}>

        {scope.isOperatorScoped && scope.unorName && (
          <div className="alert alert-light-primary border border-primary border-dashed mb-5">
            Menampilkan data ASN berdasarkan OPD aktif:
            <span className="fw-bold ms-2">{scope.unorName}</span>
          </div>
        )}

        <UnorBreadcrumb unitId={effectiveUnorId} />

        <UnorStats unitId={effectiveUnorId} />

        <AsnTable
          data={data}
          loading={loading}
        />

      </div>

    </div>

  )

}
