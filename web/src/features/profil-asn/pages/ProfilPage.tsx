// web/src/features/profil-asn/pages/ProfilPage.tsx
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useAsnList } from "../hooks/useAsnList"
import { useAsnStats } from "../hooks/useAsnStats"
import { AsnFilterBar } from "../components/AsnFilterBar"
import { AsnStatusTabs } from "../components/AsnStatusTabs"
import { AsnStatsBar } from "../components/AsnStatsBar"
import { AsnTable } from "../components/AsnTable"
import { AsnPagination } from "../components/AsnPagination"
import { UnitTreeCombobox } from "../components/UnitTreeCombobox"
import { useOperatorOpdScope } from "@/features/auth/hooks/useOperatorOpdScope"

function HeaderBadge({
  label,
  className,
}: {
  label: string
  className: string
}) {
  return (
    <span className={`badge fw-bold fs-8 px-4 py-2 ${className}`}>{label}</span>
  )
}

export default function ProfilPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const scope = useOperatorOpdScope()

  const initialSearch = searchParams.get("search") ?? ""

  const [searchInput, setSearchInput] = useState(initialSearch)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [status, setStatus] = useState("")
  const [jenisJabatanId, setJenisJabatanId] = useState("")
  const [selectedUnorId, setSelectedUnorId] = useState<number | undefined>()
  const [selectedUnorName, setSelectedUnorName] = useState("")
  const [page, setPage] = useState(1)

  const effectiveUnorId = scope.isOperatorScoped ? scope.unorId : selectedUnorId

  const { data, total, limit, loading } = useAsnList({
    search: searchQuery,
    status,
    jenisJabatanId,
    unorId: effectiveUnorId,
    page,
  })

  const { stats, loading: statsLoading } = useAsnStats(effectiveUnorId)

  useEffect(() => {
    const nextSearch = searchParams.get("search") ?? ""

    if (nextSearch !== searchInput) {
      setSearchInput(nextSearch)
    }

    if (nextSearch !== searchQuery) {
      setSearchQuery(nextSearch)
      setPage(1)
    }
  }, [searchParams])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = searchInput.trim()

      setSearchQuery((prev) => {
        if (prev === trimmed) {
          return prev
        }

        setPage(1)
        return trimmed
      })

      const currentSearch = searchParams.get("search") ?? ""

      if (currentSearch === trimmed) {
        return
      }

      const nextParams = new URLSearchParams(searchParams)

      if (trimmed) {
        nextParams.set("search", trimmed)
      } else {
        nextParams.delete("search")
      }

      setSearchParams(nextParams, { replace: true })
    }, 300)

    return () => window.clearTimeout(timer)
  }, [searchInput, searchParams, setSearchParams])

  const handleSearch = (value: string) => {
    setSearchInput(value)
  }

  const handleJabatan = (value: string) => {
    setJenisJabatanId(value)
    setPage(1)
  }

  const handleStatus = (value: string) => {
    setStatus(value)
    setPage(1)
  }

  const handleUnitSelect = (id: number, name?: string) => {
    if (scope.isOperatorScoped) return

    setSelectedUnorId(id)
    setSelectedUnorName(name ?? "")
    setPage(1)
  }

  const handleUnitClear = () => {
    if (scope.isOperatorScoped) return

    setSelectedUnorId(undefined)
    setSelectedUnorName("")
    setPage(1)
  }

  const handleResetFilters = () => {
    setSearchInput("")
    setSearchQuery("")
    setJenisJabatanId("")
    setSelectedUnorId(undefined)
    setSelectedUnorName("")
    setPage(1)

    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete("search")
    setSearchParams(nextParams, { replace: true })
  }

  const activeUnitLabel = useMemo(() => {
    if (scope.isOperatorScoped) {
      return scope.unorName ?? "OPD Aktif"
    }

    return selectedUnorName || "Semua Unit"
  }, [scope.isOperatorScoped, scope.unorName, selectedUnorName])

  if (scope.loading) {
    return (
      <div className="container-fluid">
        <div className="card shadow-sm border-0">
          <div className="card-body py-10 text-center text-muted fw-semibold">
            Menyiapkan data ASN OPD...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid">
      <div
        className="card border-0 shadow-sm mb-6"
        style={{
          background:
            "linear-gradient(90deg, #2754d7 0%, #0f214f 60%, #091531 100%)",
        }}
      >
        <div className="card-body p-5 p-lg-6">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">
            <div className="flex-grow-1">
              <div className="text-white opacity-75 fs-8 fw-semibold text-uppercase mb-2">
                Data ASN / Daftar Pegawai
              </div>

              <h1 className="text-white fw-bolder mb-2">Daftar Pegawai</h1>

              <div className="text-white opacity-75 fs-6 fw-semibold mb-3">
                Pencarian ASN berbasis filter, unit organisasi, dan status
                kepegawaian.
              </div>

              <div className="d-flex flex-wrap gap-3">
                <HeaderBadge
                  label={status}
                  className="badge-light-primary text-primary"
                />
                <HeaderBadge
                  label={activeUnitLabel}
                  className="badge-light-success text-success"
                />
                <HeaderBadge
                  label={`${total.toLocaleString("id-ID")} Data`}
                  className="badge-light-warning text-warning"
                />
              </div>
            </div>

            <div className="d-flex justify-content-center justify-content-lg-end">
              <div
                className="symbol symbol-65px symbol-lg-70px"
                style={{ minWidth: 72 }}
              >
                <span
                  className="symbol-label"
                  style={{
                    background: "rgba(255,255,255,0.10)",
                    borderRadius: "50%",
                  }}
                >
                  <i className="ki-duotone ki-address-book fs-2x text-white">
                    <span className="path1" />
                    <span className="path2" />
                    <span className="path3" />
                  </i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AsnFilterBar
        search={searchInput}
        jabatan={jenisJabatanId}
        hideUnorFilter={scope.isOperatorScoped}
        fixedUnorLabel={scope.unorName}
        unorPicker={
          <UnitTreeCombobox
            selected={selectedUnorId}
            valueLabel={selectedUnorName}
            onSelect={handleUnitSelect}
            onClear={handleUnitClear}
          />
        }
        onSearch={handleSearch}
        onJabatan={handleJabatan}
        onReset={handleResetFilters}
      />

      <div className="card shadow-sm border-0 mb-6">
        <div className="card-body p-4 p-lg-5">
          <div className="d-flex flex-column flex-xl-row align-items-xl-center justify-content-between gap-4">
            <AsnStatusTabs status={status} onChange={handleStatus} />
            <AsnStatsBar stats={stats} loading={statsLoading} />
          </div>
        </div>
      </div>

      {scope.isOperatorScoped && scope.unorName && (
        <div className="alert alert-primary d-flex align-items-center mb-6">
          <i className="ki-duotone ki-office-bag fs-2 text-primary me-3">
            <span className="path1" />
            <span className="path2" />
          </i>
          <div className="fw-semibold">
            OPD aktif: <span className="fw-bolder">{scope.unorName}</span>
          </div>
        </div>
      )}

      {!scope.isOperatorScoped && selectedUnorName && (
        <div className="alert alert-info d-flex align-items-center mb-6">
          <i className="ki-duotone ki-geolocation fs-2 text-info me-3">
            <span className="path1" />
            <span className="path2" />
          </i>
          <div className="fw-semibold">
            Unit aktif: <span className="fw-bolder">{selectedUnorName}</span>
          </div>
        </div>
      )}

      <div className="card shadow-sm border-0">
        <div className="card-header border-0 pt-6 pb-2">
          <div className="card-title d-flex flex-column">
            <span className="fs-3 fw-bolder text-gray-900">Data Pegawai</span>
            <span className="text-muted fs-7">
              Menampilkan daftar ASN sesuai filter aktif.
            </span>
          </div>
        </div>

        <div className="card-body pt-0">
          <AsnTable data={data} loading={loading} />
          <AsnPagination
            page={page}
            total={total}
            limit={limit}
            onPage={setPage}
          />
        </div>
      </div>
    </div>
  )
}