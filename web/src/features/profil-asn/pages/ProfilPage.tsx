import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { useAsnList } from "../hooks/useAsnList"
import { useAsnStats } from "../hooks/useAsnStats"

import { AsnFilterBar } from "../components/AsnFilterBar"
import { AsnStatusTabs } from "../components/AsnStatusTabs"
import { AsnStatsBar } from "../components/AsnStatsBar"
import { AsnTable } from "../components/AsnTable"
import { AsnPagination } from "../components/AsnPagination"
import { UnitTree } from "../components/UnitTree"
import ExplorerLayout from "../components/ExplorerLayout"
import { useOperatorOpdScope } from "@/features/auth/hooks/useOperatorOpdScope"

export default function ProfilPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const scope = useOperatorOpdScope()

  const [search, setSearch] = useState(
    searchParams.get("search") ?? ""
  )
  const [status, setStatus] = useState("PNS")
  const [jenisJabatanId, setJenisJabatanId] = useState("")

  /* ===============================
     UNIT STATE
  =============================== */

  const [treeUnorId, setTreeUnorId] = useState<number | undefined>()
  const [filterUnorId, setFilterUnorId] = useState<number | undefined>()

  const [page, setPage] = useState(1)
  const [unitName, setUnitName] = useState<string>("")

  /* ===============================
     GLOBAL FILTER CHECK
  =============================== */

  const isGlobalFilterActive =
    search !== "" ||
    jenisJabatanId !== "" ||
    filterUnorId !== undefined

  const effectiveUnorId = scope.isOperatorScoped
    ? scope.unorId
    : isGlobalFilterActive
      ? filterUnorId
      : treeUnorId

  /* ===============================
     LOAD DATA
  =============================== */

  const { data, total, limit, loading } = useAsnList({
    search,
    status,
    jenisJabatanId,
    unorId: effectiveUnorId,
    page
  })

  const { stats } = useAsnStats(effectiveUnorId)

  /* ===============================
     HANDLER
  =============================== */

  const handleSearch = (v: string) => {
    setSearch(v)
    setPage(1)
  }

  useEffect(() => {
    const nextSearch = searchParams.get("search") ?? ""

    if (nextSearch !== search) {
      setSearch(nextSearch)
      setPage(1)
    }
  }, [searchParams])

  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    const trimmedSearch = search.trim()
    const currentSearch = searchParams.get("search") ?? ""

    if (trimmedSearch === currentSearch) {
      return
    }

    if (trimmedSearch) {
      params.set("search", trimmedSearch)
    } else {
      params.delete("search")
    }

    setSearchParams(params, { replace: true })
  }, [search, searchParams, setSearchParams])

  const handleJabatan = (v: string) => {
    setJenisJabatanId(v)
    setPage(1)
  }

  const handleUnor = (v?: string | number) => {
    if (scope.isOperatorScoped) return

    const id = v ? Number(v) : undefined
    setFilterUnorId(id)
    setPage(1)
  }

  const handleTreeSelect = (id: number, name?: string) => {
    if (scope.isOperatorScoped) return

    setTreeUnorId(id)
    if (name) setUnitName(name)
    setPage(1)
  }

  const handleStatus = (v: string) => {
    setStatus(v)
    setPage(1)
  }

  if (scope.loading) {
    return (
      <div className="container-fluid">
        <div className="card p-10 text-center">
          Menyiapkan data ASN OPD...
        </div>
      </div>
    )
  }

  return (

    <div className="container-fluid">

      <ExplorerLayout
        sidebar={
          scope.isOperatorScoped ? (
            <div className="card">
              <div className="card-body">
                <div className="fw-bold text-gray-900 mb-2">
                  Scope OPD
                </div>
                <div className="text-gray-700">
                  {scope.unorName ?? "Unit kerja operator"}
                </div>
                <div className="text-muted fs-7 mt-2">
                  Data ASN dibatasi ke OPD aktif Anda.
                </div>
              </div>
            </div>
          ) : (
            <UnitTree
              selected={treeUnorId}
              onSelect={handleTreeSelect}
            />
          )
        }
      >

        {/* FILTER BAR */}

        <AsnFilterBar
          search={search}
          jabatan={jenisJabatanId}
          unor={filterUnorId}
          hideUnorFilter={scope.isOperatorScoped}
          fixedUnorLabel={scope.unorName}
          onSearch={handleSearch}
          onJabatan={handleJabatan}
          onUnor={handleUnor}
        />

        {/* STATUS + STATS */}

        <div className="card mb-5">

          <div className="card-body d-flex justify-content-between align-items-center">

            <AsnStatusTabs
              status={status}
              onChange={handleStatus}
            />

            <AsnStatsBar stats={stats} />

          </div>

        </div>

        {/* ACTIVE UNIT */}

        {!scope.isOperatorScoped && !isGlobalFilterActive && treeUnorId && unitName && (

          <div className="mb-3 text-muted small">

            <b>Unit Aktif :</b> {unitName}

          </div>

        )}

        {scope.isOperatorScoped && scope.unorName && (
          <div className="mb-3 text-muted small">
            <b>OPD Aktif :</b> {scope.unorName}
          </div>
        )}

        {/* TABLE */}

        <div className="card">

          <div className="card-body p-0">

            <div className="p-6">

              <AsnTable
                data={data}
                loading={loading}
              />

            </div>

            <div className="border-top p-4">

              <AsnPagination
                page={page}
                total={total}
                limit={limit}
                onPage={setPage}
              />

            </div>

          </div>

        </div>

      </ExplorerLayout>

    </div>

  )

}
