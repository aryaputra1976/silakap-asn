import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useAsnList } from "@/features/profil-asn/hooks/useAsnList"
import type { AsnItem } from "@/features/profil-asn/hooks/useAsnList"
import { useAsnDetail } from "@/features/profil-asn/hooks/useAsnDetail"
import { AsnJabatanTab } from "@/features/profil-asn/tabs/AsnJabatanTab"
import { AsnPangkatTab } from "@/features/profil-asn/tabs/AsnPangkatTab"
import { AsnPendidikanTab } from "@/features/profil-asn/tabs/AsnPendidikanTab"
import { AsnDiklatTab } from "@/features/profil-asn/tabs/AsnDiklatTab"
import { AsnKeluargaTab } from "@/features/profil-asn/tabs/AsnKeluargaTab"

/* ── Tipe tab ──────────────────────────────────────── */
type TabKey = "jabatan" | "pangkat" | "pendidikan" | "diklat" | "keluarga"

const TABS: { key: TabKey; label: string }[] = [
  { key: "jabatan", label: "Riwayat Jabatan" },
  { key: "pangkat", label: "Riwayat Pangkat" },
  { key: "pendidikan", label: "Riwayat Pendidikan" },
  { key: "diklat", label: "Riwayat Diklat" },
  { key: "keluarga", label: "Data Keluarga" },
]

/* ── DPCP Readiness ────────────────────────────────── */
function DpcpReadinessCard({ asnId }: { asnId: string }) {
  const { data } = useAsnDetail(asnId)

  const checks = useMemo(() => {
    if (!data) return []

    return [
      { label: "Nama & NIP", ok: Boolean(data.nama && data.nip) },
      { label: "Tempat & Tanggal Lahir", ok: Boolean(data.tempatLahir && data.tanggalLahir) },
      { label: "Jabatan Aktif", ok: Boolean(data.jabatan) },
      { label: "Pangkat / Golongan", ok: Boolean(data.golongan) },
      { label: "Jenis Kelamin", ok: Boolean(data.jenisKelamin?.nama) },
    ]
  }, [data])

  if (!data) return null

  const passed = checks.filter((c) => c.ok).length
  const total = checks.length
  const allOk = passed === total

  return (
    <div
      className={`card shadow-sm border-0 mb-6 border-start border-4 ${
        allOk ? "border-success" : "border-warning"
      }`}
    >
      <div className="card-body p-5">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <i
                className={`ki-duotone ki-shield-tick fs-2 ${
                  allOk ? "text-success" : "text-warning"
                }`}
              >
                <span className="path1" />
                <span className="path2" />
              </i>
              <span className="fw-bolder text-gray-900 fs-5">Kelengkapan Data untuk DPCP</span>
            </div>
            <div className="text-muted fs-7">
              {allOk
                ? "Data identitas lengkap — siap diverifikasi lebih lanjut."
                : `${passed} dari ${total} field terisi — lengkapi sebelum proses layanan.`}
            </div>
          </div>

          <div className="d-flex flex-wrap gap-3">
            {checks.map((c) => (
              <div key={c.label} className="d-flex align-items-center gap-2">
                <i
                  className={`ki-duotone ${
                    c.ok ? "ki-check-circle text-success" : "ki-cross-circle text-danger"
                  } fs-4`}
                >
                  <span className="path1" />
                  <span className="path2" />
                </i>
                <span className="text-gray-700 fs-7 fw-semibold">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Header pegawai terpilih ───────────────────────── */
function SelectedAsnHeader({
  asn,
  onGanti,
}: {
  asn: AsnItem
  onGanti: () => void
}) {
  return (
    <div className="card shadow-sm border-0 mb-6">
      <div className="card-body p-5">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4">
          <div className="d-flex align-items-center gap-4">
            <span className="symbol symbol-50px">
              <span className="symbol-label bg-light-primary">
                <i className="ki-duotone ki-profile-user fs-2x text-primary">
                  <span className="path1" />
                  <span className="path2" />
                  <span className="path3" />
                </i>
              </span>
            </span>
            <div>
              <div className="fw-bolder text-gray-900 fs-4 mb-1">{asn.nama}</div>
              <div className="text-muted fs-7 mb-2">NIP: {asn.nip}</div>
              <div className="d-flex flex-wrap gap-2">
                <span className="badge badge-light-primary fw-bold fs-8">{asn.statusAsn}</span>
                {asn.golongan && (
                  <span className="badge badge-light-warning fw-bold fs-8">{asn.golongan}</span>
                )}
                {asn.jabatan && (
                  <span className="badge badge-light-info fw-bold fs-8 text-truncate" style={{ maxWidth: 240 }}>
                    {asn.jabatan}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-3 flex-shrink-0">
            <Link
              to={`/asn/profil/${asn.id}`}
              className="btn btn-sm btn-light-primary"
            >
              Buka Profil
            </Link>
            <button
              type="button"
              className="btn btn-sm btn-light"
              onClick={onGanti}
            >
              Ganti Pegawai
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Hasil pencarian ───────────────────────────────── */
function SearchResultList({
  items,
  loading,
  onSelect,
}: {
  items: AsnItem[]
  loading: boolean
  onSelect: (asn: AsnItem) => void
}) {
  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-10">
        <div className="spinner-border text-primary me-3" role="status" />
        <span className="text-muted fw-semibold">Mencari ASN...</span>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center text-muted py-10 fw-semibold">
        Tidak ada ASN ditemukan. Coba kata kunci lain.
      </div>
    )
  }

  return (
    <div className="d-flex flex-column gap-1" style={{ maxHeight: 360, overflowY: "auto" }}>
      {items.map((asn) => (
        <button
          key={asn.id}
          type="button"
          className="btn btn-light d-flex align-items-center gap-4 text-start p-4 hover-elevate-up"
          onClick={() => onSelect(asn)}
        >
          <span className="symbol symbol-38px flex-shrink-0">
            <span className="symbol-label bg-light-primary">
              <i className="ki-duotone ki-profile-circle fs-3 text-primary">
                <span className="path1" />
                <span className="path2" />
                <span className="path3" />
              </i>
            </span>
          </span>
          <div className="flex-grow-1 min-w-0">
            <div className="fw-bolder text-gray-900 text-truncate">{asn.nama}</div>
            <div className="text-muted fs-7">{asn.nip}</div>
          </div>
          <div className="d-flex flex-wrap gap-2 flex-shrink-0">
            <span className="badge badge-light-primary fw-bold fs-8">{asn.statusAsn}</span>
            {asn.golongan && (
              <span className="badge badge-light-secondary fw-bold fs-8">{asn.golongan}</span>
            )}
          </div>
          <i className="ki-duotone ki-arrow-right fs-3 text-primary flex-shrink-0">
            <span className="path1" />
            <span className="path2" />
          </i>
        </button>
      ))}
    </div>
  )
}

/* ── Komponen utama ────────────────────────────────── */
export default function RiwayatAsnPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [selectedAsn, setSelectedAsn] = useState<AsnItem | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>("jabatan")
  const searchRef = useRef<HTMLDivElement | null>(null)

  const pegawaiId = searchParams.get("pegawai") ?? undefined

  /* Langsung fetch detail jika ada ?pegawai=id di URL */
  const { data: preloadedDetail } = useAsnDetail(pegawaiId)

  useEffect(() => {
    if (!preloadedDetail || selectedAsn) return

    setSelectedAsn({
      id: preloadedDetail.id,
      nama: preloadedDetail.nama,
      nip: preloadedDetail.nip,
      statusAsn: preloadedDetail.statusAsn ?? "",
      jabatan: preloadedDetail.jabatan ?? undefined,
      golongan: preloadedDetail.golongan ?? undefined,
      unitKerja: preloadedDetail.unitKerja ?? undefined,
    })

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete("pegawai")
      return next
    }, { replace: true })
  }, [preloadedDetail, selectedAsn, setSearchParams])

  const { data: searchResults, loading: searchLoading } = useAsnList({
    search: searchQuery,
    page: 1,
  })

  /* Debounce search input */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = searchInput.trim()
      setSearchQuery(trimmed)

      if (trimmed) {
        setShowResults(true)
      }
    }, 300)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  /* Tutup dropdown saat klik luar */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (asn: AsnItem) => {
    setSelectedAsn(asn)
    setShowResults(false)
    setSearchInput("")
    setSearchQuery("")
    setActiveTab("jabatan")

    const next = new URLSearchParams(searchParams)
    next.delete("pegawai")
    setSearchParams(next, { replace: true })
  }

  const handleGanti = () => {
    setSelectedAsn(null)
    setSearchInput("")
    setSearchQuery("")
    setShowResults(false)
  }

  const asnIdStr = selectedAsn ? String(selectedAsn.id) : ""

  return (
    <div className="container-fluid">
      {/* Header */}
      <div
        className="card border-0 shadow-sm mb-6"
        style={{
          background: "linear-gradient(90deg, #2754d7 0%, #0f214f 60%, #091531 100%)",
        }}
      >
        <div className="card-body p-5 p-lg-6">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">
            <div className="flex-grow-1">
              <div className="text-white opacity-75 fs-8 fw-semibold text-uppercase mb-2">
                Data ASN / Riwayat Kepegawaian
              </div>
              <h1 className="text-white fw-bolder mb-2">Riwayat Kepegawaian</h1>
              <div className="text-white opacity-75 fs-6 fw-semibold">
                Workspace verifikasi riwayat ASN — jabatan, pangkat, pendidikan, diklat, dan keluarga.
              </div>
            </div>
            <div className="d-flex justify-content-center justify-content-lg-end">
              <div className="symbol symbol-65px">
                <span
                  className="symbol-label"
                  style={{ background: "rgba(255,255,255,0.10)", borderRadius: "50%" }}
                >
                  <i className="ki-duotone ki-document fs-2x text-white">
                    <span className="path1" />
                    <span className="path2" />
                  </i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      {!selectedAsn && (
        <div className="card shadow-sm border-0 mb-6">
          <div className="card-header border-0 pt-6 pb-3">
            <div className="card-title d-flex flex-column">
              <span className="fs-4 fw-bolder text-gray-900">Cari Pegawai</span>
              <span className="text-muted fs-7">
                Ketik NIP atau nama ASN untuk memulai verifikasi riwayat.
              </span>
            </div>
          </div>
          <div className="card-body pt-2 pb-6">
            <div className="position-relative" ref={searchRef}>
              <div className="position-relative mb-3">
                <i className="ki-duotone ki-magnifier fs-2 text-gray-500 position-absolute top-50 translate-middle-y ms-5">
                  <span className="path1" />
                  <span className="path2" />
                </i>
                <input
                  type="text"
                  className="form-control form-control-lg form-control-solid ps-13"
                  placeholder="Cari berdasarkan NIP atau nama ASN..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => {
                    if (searchQuery) setShowResults(true)
                  }}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              {showResults && (
                <div
                  className="card shadow-lg border-0 position-absolute start-0 w-100 mt-1"
                  style={{ zIndex: 1050 }}
                >
                  <div className="card-body p-4">
                    <SearchResultList
                      items={searchResults}
                      loading={searchLoading}
                      onSelect={handleSelect}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="text-muted fs-7">
              Pilih pegawai dari hasil pencarian untuk melihat seluruh riwayat kepegawaiannya.
            </div>
          </div>
        </div>
      )}

      {/* Workspace — setelah pegawai dipilih */}
      {selectedAsn && (
        <>
          <SelectedAsnHeader asn={selectedAsn} onGanti={handleGanti} />

          <DpcpReadinessCard asnId={asnIdStr} />

          {/* Tabs */}
          <div className="card shadow-sm border-0 mb-6">
            <div className="card-body p-4">
              <ul className="nav nav-tabs nav-line-tabs nav-line-tabs-2x mb-0 fs-6">
                {TABS.map((tab) => (
                  <li key={tab.key} className="nav-item">
                    <button
                      type="button"
                      className={`nav-link fw-semibold ${activeTab === tab.key ? "active" : ""}`}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {tab.label}
                      {tab.key === "keluarga" && (
                        <span className="badge badge-light-success fw-bold fs-9 ms-2">DPCP</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {activeTab === "jabatan" && <AsnJabatanTab asnId={asnIdStr} />}
          {activeTab === "pangkat" && <AsnPangkatTab asnId={asnIdStr} />}
          {activeTab === "pendidikan" && <AsnPendidikanTab asnId={asnIdStr} />}
          {activeTab === "diklat" && <AsnDiklatTab asnId={asnIdStr} />}
          {activeTab === "keluarga" && <AsnKeluargaTab asnId={asnIdStr} />}
        </>
      )}
    </div>
  )
}
