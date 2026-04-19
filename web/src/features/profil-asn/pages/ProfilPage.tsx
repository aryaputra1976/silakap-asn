import { useState } from "react"

import { useAsnList } from "../hooks/useAsnList"
import { useAsnStats } from "../hooks/useAsnStats"

import { AsnFilterBar } from "../components/AsnFilterBar"
import { AsnStatusTabs } from "../components/AsnStatusTabs"
import { AsnStatsBar } from "../components/AsnStatsBar"
import { AsnTable } from "../components/AsnTable"
import { AsnPagination } from "../components/AsnPagination"
import { UnitTree } from "../components/UnitTree"
import ExplorerLayout from "../components/ExplorerLayout"

export default function ProfilPage() {

  const [search, setSearch] = useState("")
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

  const effectiveUnorId = isGlobalFilterActive
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

  const handleJabatan = (v: string) => {
    setJenisJabatanId(v)
    setPage(1)
  }

  const handleUnor = (v?: string | number) => {
    const id = v ? Number(v) : undefined
    setFilterUnorId(id)
    setPage(1)
  }

  const handleTreeSelect = (id: number, name?: string) => {
    setTreeUnorId(id)
    if (name) setUnitName(name)
    setPage(1)
  }

  const handleStatus = (v: string) => {
    setStatus(v)
    setPage(1)
  }

  return (

    <div className="container-fluid">

      <ExplorerLayout
        sidebar={
          <UnitTree
            selected={treeUnorId}
            onSelect={handleTreeSelect}
          />
        }
      >

        {/* FILTER BAR */}

        <AsnFilterBar
          search={search}
          jabatan={jenisJabatanId}
          unor={filterUnorId}
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

        {!isGlobalFilterActive && treeUnorId && unitName && (

          <div className="mb-3 text-muted small">

            <b>Unit Aktif :</b> {unitName}

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