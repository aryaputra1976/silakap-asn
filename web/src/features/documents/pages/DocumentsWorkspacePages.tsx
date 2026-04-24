import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Pagination,
  Row,
  Spinner,
  Table,
} from "react-bootstrap"
import { PageTitle } from "@/_metronic/layout/core"

import { useServiceWorkspace } from "@/features/services/workspace/hooks/useServiceWorkspace"
import ServiceStatusBadge from "@/features/services/base/components/ServiceStatusBadge"
import { useDmsDashboard, useDmsSnapshots } from "@/features/dms-monitoring"
import {
  DMS_DEFAULT_SNAPSHOT_FILTERS,
  DMS_KATEGORI_OPTIONS,
  DMS_SNAPSHOT_LIMIT_OPTIONS,
  formatDmsDateTime,
  formatDmsDecimal,
} from "@/features/dms-monitoring/utils"

type SummaryPillProps = {
  label: string
  value: string | number
  variant?: "light" | "primary" | "success" | "warning"
}

function SummaryPill({
  label,
  value,
  variant = "light",
}: SummaryPillProps) {
  const className =
    variant === "primary"
      ? "bg-primary-subtle text-primary"
      : variant === "success"
        ? "bg-success-subtle text-success"
        : variant === "warning"
          ? "bg-warning-subtle text-warning"
          : "bg-white bg-opacity-10 text-white"

  return (
    <div
      className={`rounded-3 px-4 py-3 d-inline-flex flex-column gap-1 border border-white border-opacity-10 ${className}`}
      style={{ minWidth: 150 }}
    >
      <span className="fs-8 fw-semibold text-uppercase opacity-75">
        {label}
      </span>
      <span className="fs-3 fw-bold">{value}</span>
    </div>
  )
}

function WorkspaceHero({
  title,
  description,
  helper,
  icon,
  pills,
}: {
  title: string
  description: string
  helper: string
  icon: string
  pills: SummaryPillProps[]
}) {
  return (
    <Card className="border-0 shadow-sm overflow-hidden mb-5">
      <Card.Body className="p-0">
        <div
          className="px-8 py-8 text-white"
          style={{
            background:
              "linear-gradient(135deg, #2d5bdb 0%, #1d2a59 72%, #17203f 100%)",
          }}
        >
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-4">
            <div className="mw-700px">
              <h1 className="mb-3 text-white fw-bolder">{title}</h1>
              <div className="fs-4 text-white text-opacity-75 mb-4">
                {description}
              </div>

              <div className="border border-white border-opacity-25 rounded-4 px-5 py-4">
                <div className="fw-semibold fs-5 text-white">{helper}</div>

                <div className="d-flex flex-wrap gap-3 mt-4">
                  {pills.map((pill) => (
                    <SummaryPill key={pill.label} {...pill} />
                  ))}
                </div>
              </div>
            </div>

            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-10 flex-shrink-0"
              style={{ width: 104, height: 104 }}
            >
              <i className={`ki-duotone ${icon} fs-1 text-white`}>
                <span className="path1" />
                <span className="path2" />
                <span className="path3" />
              </i>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}

function PaginationBar({
  page,
  totalPages,
  total,
  limit,
  onChange,
}: {
  page: number
  totalPages: number
  total: number
  limit: number
  onChange: (page: number) => void
}) {
  if (totalPages <= 1) {
    return null
  }

  const start = Math.max(page - 2, 1)
  const end = Math.min(totalPages, start + 4)
  const pages = Array.from(
    { length: end - start + 1 },
    (_, index) => start + index,
  )

  return (
    <Card className="border-0 shadow-sm mt-4">
      <Card.Body className="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div className="text-muted small">
          Menampilkan {total === 0 ? 0 : (page - 1) * limit + 1}
          {" - "}
          {Math.min(page * limit, total)} dari {total} data
        </div>

        <Pagination className="mb-0">
          <Pagination.First
            disabled={page <= 1}
            onClick={() => onChange(1)}
          />
          <Pagination.Prev
            disabled={page <= 1}
            onClick={() => onChange(Math.max(page - 1, 1))}
          />
          {pages.map((value) => (
            <Pagination.Item
              key={value}
              active={value === page}
              onClick={() => onChange(value)}
            >
              {value}
            </Pagination.Item>
          ))}
          <Pagination.Next
            disabled={page >= totalPages}
            onClick={() => onChange(Math.min(page + 1, totalPages))}
          />
          <Pagination.Last
            disabled={page >= totalPages}
            onClick={() => onChange(totalPages)}
          />
        </Pagination>
      </Card.Body>
    </Card>
  )
}

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="py-10 text-center">
        <div className="fs-4 fw-semibold text-gray-800 mb-2">{title}</div>
        <div className="text-muted">{description}</div>
      </Card.Body>
    </Card>
  )
}

export function DokumenUsulanPage() {
  const navigate = useNavigate()
  const { data, loading } = useServiceWorkspace()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [service, setService] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10

  const serviceOptions = useMemo(() => {
    const seen = new Map<string, string>()
    data.forEach((item) => {
      if (!seen.has(item.serviceKey)) {
        seen.set(item.serviceKey, item.serviceName)
      }
    })
    return Array.from(seen.entries()).map(([value, label]) => ({
      value,
      label,
    }))
  }, [data])

  const statusOptions = useMemo(() => {
    return Array.from(new Set(data.map((item) => item.status)))
  }, [data])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return data.filter((item) => {
      const matchSearch =
        !keyword ||
        item.nama.toLowerCase().includes(keyword) ||
        item.nip.toLowerCase().includes(keyword) ||
        item.serviceName.toLowerCase().includes(keyword) ||
        item.serviceKey.toLowerCase().includes(keyword)

      const matchStatus = !status || item.status === status
      const matchService = !service || item.serviceKey === service

      return matchSearch && matchStatus && matchService
    })
  }, [data, search, service, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit))
  const pageData = filtered.slice((page - 1) * limit, page * limit)

  return (
    <div className="container-fluid">
      <PageTitle breadcrumbs={[
        { title: "Dashboard", path: "/dashboard", isSeparator: false, isActive: false },
        { title: "Dokumen & Arsip", path: "/dokumen/usulan", isSeparator: false, isActive: false },
      ]}>
        Dokumen Usulan
      </PageTitle>

      <WorkspaceHero
        title="Dokumen Usulan"
        description="Kelola usulan lintas layanan yang membutuhkan pemeriksaan dokumen, lalu buka detail usulan untuk melihat atau mengunggah berkas pendukung."
        helper="Gunakan halaman ini untuk menelusuri usulan yang sedang aktif, memfilter berdasarkan layanan atau status, lalu masuk ke detail usulan untuk tindakan dokumen lebih lanjut."
        icon="ki-file-up"
        pills={[
          { label: "Total Usulan", value: data.length },
          { label: "Hasil Filter", value: filtered.length, variant: "primary" },
          {
            label: "Layanan Aktif",
            value: serviceOptions.length,
            variant: "success",
          },
        ]}
      />

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col lg={4}>
              <Form.Group>
                <Form.Label>Cari Usulan</Form.Label>
                <Form.Control
                  value={search}
                  placeholder="Cari nama ASN, NIP, atau layanan"
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setPage(1)
                  }}
                />
              </Form.Group>
            </Col>

            <Col lg={3}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value)
                    setPage(1)
                  }}
                >
                  <option value="">Semua Status</option>
                  {statusOptions.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col lg={3}>
              <Form.Group>
                <Form.Label>Layanan</Form.Label>
                <Form.Select
                  value={service}
                  onChange={(event) => {
                    setService(event.target.value)
                    setPage(1)
                  }}
                >
                  <option value="">Semua Layanan</option>
                  {serviceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col lg={2}>
              <div className="d-flex gap-2">
                <Button
                  variant="light"
                  className="w-100"
                  onClick={() => {
                    setSearch("")
                    setStatus("")
                    setService("")
                    setPage(1)
                  }}
                >
                  Reset
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="py-10 text-center">
            <Spinner />
          </Card.Body>
        </Card>
      ) : pageData.length === 0 ? (
        <EmptyState
          title="Belum ada usulan yang cocok"
          description="Ubah pencarian atau filter, lalu buka detail layanan saat usulan yang dicari sudah muncul."
        />
      ) : (
        <>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="ps-6">Layanan</th>
                      <th>ASN</th>
                      <th>Status</th>
                      <th>Tanggal Usul</th>
                      <th className="text-end pe-6">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.map((item) => (
                      <tr key={`${item.serviceKey}-${item.id}`}>
                        <td className="ps-6">
                          <div className="fw-semibold text-gray-900">{item.serviceName}</div>
                          <div className="text-muted small">{item.serviceKey}</div>
                        </td>
                        <td>
                          <div className="fw-semibold text-gray-900">{item.nama}</div>
                          <div className="text-muted small">{item.nip}</div>
                        </td>
                        <td>
                          <ServiceStatusBadge status={item.status} />
                        </td>
                        <td className="text-gray-700">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString("id-ID")
                            : "-"}
                        </td>
                        <td className="text-end pe-6">
                          <Button
                            size="sm"
                            onClick={() =>
                              navigate(`/layanan/${item.serviceKey}/${item.id}`)
                            }
                          >
                            Buka Detail
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>

          <PaginationBar
            page={page}
            totalPages={totalPages}
            total={filtered.length}
            limit={limit}
            onChange={setPage}
          />
        </>
      )}
    </div>
  )
}

function SnapshotWorkspace({
  title,
  description,
  helper,
  icon,
  mode,
}: {
  title: string
  description: string
  helper: string
  icon: string
  mode: "compliance" | "pegawai"
}) {
  const operatorMode = mode === "pegawai"
  const [filters, setFilters] = useState({
    ...DMS_DEFAULT_SNAPSHOT_FILTERS,
    limit: 10,
    kategori: mode === "compliance" ? "Kurang Lengkap" : "",
  })
  const snapshotsQuery = useDmsSnapshots(filters)
  const dashboardQuery = useDmsDashboard(
    filters.unorId ? { unorId: filters.unorId } : {},
  )

  const items = snapshotsQuery.data?.data ?? []
  const pagination = snapshotsQuery.data?.pagination
  const summary = dashboardQuery.data?.summary

  const activeKategori = useMemo(() => {
    if (!filters.kategori) {
      return "Semua kategori"
    }

    return (
      DMS_KATEGORI_OPTIONS.find((option) => option.value === filters.kategori)
        ?.label ?? filters.kategori
    )
  }, [filters.kategori])

  return (
    <div className="container-fluid">
      <PageTitle breadcrumbs={[
        { title: "Dashboard", path: "/dashboard", isSeparator: false, isActive: false },
        { title: "Dokumen & Arsip", path: operatorMode ? "/dokumen/pegawai" : "/dokumen/kelengkapan", isSeparator: false, isActive: false },
      ]}>
        {title}
      </PageTitle>

      <WorkspaceHero
        title={title}
        description={description}
        helper={helper}
        icon={icon}
        pills={[
          { label: "Total ASN", value: summary?.totalAsn ?? 0 },
          {
            label: operatorMode ? "Skor Arsip" : "Matched Pegawai",
            value: operatorMode
              ? formatDmsDecimal(summary?.avgSkorArsip ?? null)
              : summary?.matchedPegawai ?? 0,
            variant: "primary",
          },
          {
            label: mode === "compliance" ? "Fokus Review" : "Kategori Aktif",
            value:
              mode === "compliance"
                ? "Kepatuhan Dokumen"
                : activeKategori,
            variant: "success",
          },
        ]}
      />

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col lg={operatorMode ? 4 : 3}>
              <Form.Group>
                <Form.Label>Pencarian ASN</Form.Label>
                <Form.Control
                  value={filters.nip ?? ""}
                  placeholder="Cari NIP atau nama ASN"
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      page: 1,
                      nip: event.target.value,
                    }))
                  }
                />
              </Form.Group>
            </Col>

            <Col lg={operatorMode ? 3 : 3}>
              <Form.Group>
                <Form.Label>Kategori</Form.Label>
                <Form.Select
                  value={filters.kategori ?? ""}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      page: 1,
                      kategori: event.target.value,
                    }))
                  }
                >
                  {DMS_KATEGORI_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col lg={operatorMode ? 3 : 2}>
              <Form.Group>
                <Form.Label>Limit</Form.Label>
                <Form.Select
                  value={String(filters.limit ?? 10)}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      page: 1,
                      limit: Number(event.target.value),
                    }))
                  }
                >
                  {DMS_SNAPSHOT_LIMIT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {!operatorMode ? (
              <Col lg={2}>
                <Form.Group>
                  <Form.Label>ID Unit</Form.Label>
                  <Form.Control
                    value={filters.unorId ?? ""}
                    placeholder="Filter unit"
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        page: 1,
                        unorId: event.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Col>
            ) : null}

            <Col lg={operatorMode ? 2 : 2}>
              <div className="d-flex">
                <Button
                  variant="light"
                  className="w-100"
                  onClick={() =>
                    setFilters({
                      ...DMS_DEFAULT_SNAPSHOT_FILTERS,
                      limit: 10,
                      kategori: mode === "compliance" ? "Kurang Lengkap" : "",
                    })
                  }
                >
                  Reset
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <div className="fw-semibold text-gray-900 mb-1">Ringkasan Monitoring</div>
            <div className="text-muted small">
              {mode === "compliance"
                ? "Fokuskan review pada ASN dengan kategori kurang lengkap atau tidak lengkap sebelum masuk proses approval."
                : `Last sync: ${formatDmsDateTime(summary?.latestSync ?? null)}`}
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <Badge bg="light" text="dark" className="fs-7 px-4 py-3">
              Matched Unit {summary?.matchedUnor ?? 0}
            </Badge>
            <Badge bg="light" text="dark" className="fs-7 px-4 py-3">
              Matched Pegawai {summary?.matchedPegawai ?? 0}
            </Badge>
          </div>
        </Card.Body>
      </Card>

      {snapshotsQuery.isLoading ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="py-10 text-center">
            <Spinner />
          </Card.Body>
        </Card>
      ) : items.length === 0 ? (
        <EmptyState
          title="Belum ada data dokumen"
          description="Gunakan pencarian atau ubah filter untuk menampilkan arsip ASN yang sesuai."
        />
      ) : (
        <>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">
                {operatorMode
                  ? "Daftar Dokumen Pegawai"
                  : "Daftar Risiko Kelengkapan Dokumen"}
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead>
                    <tr>
                      {operatorMode ? <th className="ps-6">No</th> : <th className="ps-6">ASN</th>}
                      {operatorMode ? <th>NIP</th> : null}
                      {operatorMode ? <th>Nama</th> : null}
                      <th>Unit</th>
                      {operatorMode ? <th>DRH</th> : null}
                      {operatorMode ? <th>CPNS</th> : null}
                      {operatorMode ? <th>D2NP</th> : null}
                      {operatorMode ? <th>SPMT</th> : null}
                      {operatorMode ? <th>PNS</th> : null}
                      <th>{operatorMode ? "Skor Arsip" : "Kategori"}</th>
                      <th>{operatorMode ? "Kategori" : "Skor"}</th>
                      {!operatorMode ? <th>Validasi Match</th> : null}
                      {!operatorMode ? <th>Last Sync</th> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.id}>
                        {operatorMode ? <td className="ps-6">{index + 1}</td> : <td className="ps-6"><div className="fw-semibold">{item.namaSnapshot}</div><div className="text-muted small">{item.nip}</div></td>}
                        {operatorMode ? <td className="fw-semibold">{item.nip}</td> : null}
                        {operatorMode ? <td>{item.namaSnapshot}</td> : null}
                        <td>{item.unorNama ?? item.unitKerjaRaw ?? "-"}</td>
                        {operatorMode ? <td>{item.drh ? "Ya" : "Tidak"}</td> : null}
                        {operatorMode ? <td>{item.cpns ? "Ya" : "Tidak"}</td> : null}
                        {operatorMode ? <td>{item.d2np ? "Ya" : "Tidak"}</td> : null}
                        {operatorMode ? <td>{item.spmt ? "Ya" : "Tidak"}</td> : null}
                        {operatorMode ? <td>{item.pns ? "Ya" : "Tidak"}</td> : null}
                        <td>{operatorMode ? formatDmsDecimal(item.skorArsip) : item.kategoriKelengkapan ?? "-"}</td>
                        <td>{operatorMode ? item.kategoriKelengkapan ?? "-" : formatDmsDecimal(item.skorArsip)}</td>
                        {!operatorMode ? (
                          <td>
                            <div className="small">Pegawai: {item.isMatchedPegawai ? "Matched" : "Belum"}</div>
                            <div className="small">Unit: {item.isMatchedUnor ? "Matched" : "Belum"}</div>
                          </td>
                        ) : null}
                        {!operatorMode ? <td>{formatDmsDateTime(item.lastSync)}</td> : null}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>

          {pagination ? (
            <PaginationBar
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onChange={(nextPage) =>
                setFilters((current) => ({
                  ...current,
                  page: nextPage,
                }))
              }
            />
          ) : null}
        </>
      )}
    </div>
  )
}

export function KelengkapanDokumenPage() {
  return (
    <SnapshotWorkspace
      title="Kelengkapan Dokumen"
      description="Pantau kecocokan arsip dan kategori kelengkapan dokumen ASN agar proses verifikasi dan approval tidak tersendat."
      helper="Gunakan halaman ini untuk memantau kategori kelengkapan, memeriksa unit yang belum rapi, dan memastikan dokumen pendukung siap sebelum usulan diproses lebih lanjut."
      icon="ki-file-sheet"
      mode="compliance"
    />
  )
}

export function DokumenPegawaiPage() {
  return (
    <SnapshotWorkspace
      title="Dokumen Pegawai"
      description="Telusuri arsip ASN per NIP, unit kerja, dan indikator dokumen inti agar operator lebih cepat menindaklanjuti berkas pegawai."
      helper="Halaman ini difokuskan pada pencarian arsip pegawai dan kelengkapan dokumen inti seperti DRH, CPNS, D2NP, SPMT, dan PNS."
      icon="ki-folder"
      mode="pegawai"
    />
  )
}
