import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import {
  Button,
  Card,
  Col,
  Container,
  Pagination,
  Row,
  Spinner,
} from "react-bootstrap"
import { useAuthStore } from "@/stores/auth.store"

import type {
  DmsBatchFilters,
  DmsImportResult,
  DmsSnapshotFilters,
} from "@/features/dms-monitoring"

import {
  DmsBatchCreateDialog,
  DmsBatchFilterBar,
  DmsBatchTable,
  DmsDashboardByUnorTable,
  DmsDashboardDokumenStats,
  DmsDashboardKategoriChart,
  DmsDashboardSummaryCards,
  DmsImportDialog,
  DmsImportResultPanel,
  DmsSnapshotFilterBar,
  DmsSnapshotTable,
  useCreateDmsBatch,
  useDmsBatches,
  useDmsDashboard,
  useDmsSnapshots,
  useImportDmsBatch,
} from "@/features/dms-monitoring"

import {
  DMS_BATCH_LIMIT_OPTIONS,
  DMS_DEFAULT_BATCH_FILTERS,
  DMS_DEFAULT_SNAPSHOT_FILTERS,
  DMS_KATEGORI_OPTIONS,
  DMS_SNAPSHOT_LIMIT_OPTIONS,
  DMS_STATUS_OPTIONS,
} from "@/features/dms-monitoring/utils"

export default function DmsMonitoringPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const roles = useAuthStore((state) => state.user?.roles ?? [])
  const isOperatorView =
    roles.includes("OPERATOR") &&
    !roles.includes("SUPER_ADMIN") &&
    !roles.includes("ADMIN_BKPSDM")

  const [filters, setFilters] = useState<DmsBatchFilters>({
    ...DMS_DEFAULT_BATCH_FILTERS,
  })
  const [snapshotFilters, setSnapshotFilters] = useState<DmsSnapshotFilters>({
    ...DMS_DEFAULT_SNAPSHOT_FILTERS,
    nip: searchParams.get("nip") ?? DMS_DEFAULT_SNAPSHOT_FILTERS.nip,
    limit: 10,
  })

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [lastImportResult, setLastImportResult] =
    useState<DmsImportResult | null>(null)

  const batchesQuery = useDmsBatches(filters)

  const dashboardQuery = useDmsDashboard(
    filters.unorId ? { unorId: filters.unorId } : {},
  )
  const snapshotsQuery = useDmsSnapshots(snapshotFilters)

  const createBatchMutation = useCreateDmsBatch()
  const importBatchMutation = useImportDmsBatch()

  const lastDraftBatches = useMemo(
    () => batchesQuery.data?.data ?? [],
    [batchesQuery.data?.data],
  )
  const operatorScopeName = useMemo(() => {
    const topUnit = dashboardQuery.data?.byUnor?.[0]?.unorNama
    const snapshotUnit = snapshotsQuery.data?.data?.[0]?.unorNama

    return topUnit ?? snapshotUnit ?? "OPD aktif"
  }, [dashboardQuery.data?.byUnor, snapshotsQuery.data?.data])
  const snapshotPagination = snapshotsQuery.data?.pagination
  const searchedNip = searchParams.get("nip")?.trim() ?? ""
  const operatorPageItems = useMemo(() => {
    if (!snapshotPagination || snapshotPagination.totalPages <= 1) {
      return []
    }

    const currentPage = snapshotPagination.page
    const totalPages = snapshotPagination.totalPages
    const startPage = Math.max(currentPage - 2, 1)
    const endPage = Math.min(startPage + 4, totalPages)
    const normalizedStart = Math.max(endPage - 4, 1)

    return Array.from(
      { length: endPage - normalizedStart + 1 },
      (_, index) => normalizedStart + index,
    )
  }, [snapshotPagination])

  useEffect(() => {
    const nextNip = searchParams.get("nip")?.trim() ?? ""

    setSnapshotFilters((current) => {
      if ((current.nip ?? "") === nextNip) {
        return current
      }

      return {
        ...current,
        page: 1,
        nip: nextNip,
      }
    })
  }, [searchParams])

  function updateSnapshotFilters(next: DmsSnapshotFilters) {
    setSnapshotFilters(next)

    const params = new URLSearchParams(searchParams)
    const nip = next.nip?.trim() ?? ""

    if (nip) {
      params.set("nip", nip)
    } else {
      params.delete("nip")
    }

    setSearchParams(params, { replace: true })
  }

  function resetSnapshotFilters() {
    const params = new URLSearchParams(searchParams)
    params.delete("nip")
    setSearchParams(params, { replace: true })

    setSnapshotFilters({
      ...DMS_DEFAULT_SNAPSHOT_FILTERS,
      limit: 10,
    })
  }

  if (isOperatorView) {
    return (
      <Container fluid className="py-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <h3 className="mb-1">DMS Monitoring OPD</h3>
            <p className="text-muted mb-0">
              Rekap kelengkapan dokumen ASN pada unit kerja aktif dalam format operasional.
            </p>
          </div>
        </div>

        <div className="border rounded-3 bg-white shadow-sm px-4 py-3 mb-4">
          <div className="fw-semibold text-dark mb-1">
            Unit kerja aktif: {operatorScopeName}
          </div>
          <div className="text-muted small">
            Tampilan operator difokuskan pada tabel rekap ASN per OPD, bukan dashboard manajerial.
          </div>
        </div>

        <DmsSnapshotFilterBar
          filters={snapshotFilters}
          limitOptions={DMS_SNAPSHOT_LIMIT_OPTIONS}
          kategoriOptions={DMS_KATEGORI_OPTIONS}
          operatorMode
          onChange={(next) =>
            updateSnapshotFilters({
              batchId: next.batchId ?? "",
              page: next.page ?? 1,
              limit: next.limit ?? 10,
              unorId: next.unorId ?? "",
              kategori: next.kategori ?? "",
              nip: next.nip ?? "",
            })
          }
          onReset={resetSnapshotFilters}
        />

        <DmsSnapshotTable
          items={snapshotsQuery.data?.data ?? []}
          isLoading={snapshotsQuery.isLoading}
          operatorMode
        />

        {!snapshotsQuery.isLoading && snapshotPagination ? (
          <Card className="border-0 shadow-sm mt-4">
            <Card.Body className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div className="text-muted small">
                Menampilkan{" "}
                {snapshotPagination.total === 0
                  ? 0
                  : (snapshotPagination.page - 1) * snapshotPagination.limit + 1}
                {" - "}
                {Math.min(
                  snapshotPagination.page * snapshotPagination.limit,
                  snapshotPagination.total,
                )}{" "}
                dari {snapshotPagination.total} data
                {" · "}
                Halaman {snapshotPagination.page} dari {snapshotPagination.totalPages}
              </div>

              <Pagination className="mb-0">
                <Pagination.First
                  disabled={snapshotPagination.page <= 1}
                  onClick={() =>
                    setSnapshotFilters((current) => ({
                      ...current,
                      page: 1,
                    }))
                  }
                />
                <Pagination.Prev
                  disabled={snapshotPagination.page <= 1}
                  onClick={() =>
                    setSnapshotFilters((current) => ({
                      ...current,
                      page: Math.max((current.page ?? 1) - 1, 1),
                    }))
                  }
                />
                {operatorPageItems.map((page) => (
                  <Pagination.Item
                    key={page}
                    active={page === snapshotPagination.page}
                    onClick={() =>
                      setSnapshotFilters((current) => ({
                        ...current,
                        page,
                      }))
                    }
                  >
                    {page}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  disabled={
                    snapshotPagination.page >= snapshotPagination.totalPages
                  }
                  onClick={() =>
                    setSnapshotFilters((current) => ({
                      ...current,
                      page: Math.min(
                        (current.page ?? 1) + 1,
                        snapshotPagination.totalPages,
                      ),
                    }))
                  }
                />
                <Pagination.Last
                  disabled={
                    snapshotPagination.page >= snapshotPagination.totalPages
                  }
                  onClick={() =>
                    setSnapshotFilters((current) => ({
                      ...current,
                      page: snapshotPagination.totalPages,
                    }))
                  }
                />
              </Pagination>
            </Card.Body>
          </Card>
        ) : null}
      </Container>
    )
  }

  return (
    <Container fluid className="py-4">
      {/* HEADER */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="mb-1">DMS Monitoring</h3>
          <p className="text-muted mb-0">
            Monitoring batch import, dashboard kelengkapan, dan hasil snapshot ASN.
          </p>
        </div>

        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            onClick={() => setShowCreateDialog(true)}
          >
            Buat Batch
          </Button>

          <Button onClick={() => setShowImportDialog(true)}>
            Import Excel
          </Button>
        </div>
      </div>

      {/* DASHBOARD */}
      <Row className="g-4 mb-4">
        <Col xs={12}>
          {dashboardQuery.isLoading ? (
            <div className="d-flex align-items-center justify-content-center py-5">
              <Spinner />
            </div>
          ) : dashboardQuery.data ? (
            <DmsDashboardSummaryCards
              summary={dashboardQuery.data.summary}
            />
          ) : null}
        </Col>

        <Col lg={5}>
          {dashboardQuery.data && (
            <DmsDashboardKategoriChart
              items={dashboardQuery.data.byKategori}
            />
          )}
        </Col>

        <Col lg={7}>
          {dashboardQuery.data && (
            <DmsDashboardDokumenStats
              stats={dashboardQuery.data.dokumenStats}
              totalAsn={dashboardQuery.data.summary.totalAsn}
            />
          )}
        </Col>

        <Col xs={12}>
          {dashboardQuery.data && (
            <DmsDashboardByUnorTable
              items={dashboardQuery.data.byUnor}
            />
          )}
        </Col>

        <Col xs={12}>
          <DmsImportResultPanel
            result={importBatchMutation.data ?? lastImportResult}
          />
        </Col>
      </Row>

      {/* FILTER */}
      <DmsBatchFilterBar
        filters={filters}
        statusOptions={DMS_STATUS_OPTIONS}
        limitOptions={DMS_BATCH_LIMIT_OPTIONS}
  onChange={(next) => setFilters(next)}
  onReset={() =>
    setFilters({
      ...DMS_DEFAULT_BATCH_FILTERS,
    })
  }
/>

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-4 mb-3">
        <div>
          <h5 className="mb-1">Snapshot ASN DMS</h5>
          <div className="text-muted small">
            {searchedNip
              ? `Menampilkan hasil monitoring dokumen untuk pencarian ASN: ${searchedNip}`
              : "Gunakan filter untuk menelusuri snapshot kelengkapan arsip ASN."}
          </div>
        </div>
      </div>

      <DmsSnapshotFilterBar
        filters={snapshotFilters}
        limitOptions={DMS_SNAPSHOT_LIMIT_OPTIONS}
        kategoriOptions={DMS_KATEGORI_OPTIONS}
        onChange={updateSnapshotFilters}
        onReset={resetSnapshotFilters}
      />

      <DmsSnapshotTable
        items={snapshotsQuery.data?.data ?? []}
        isLoading={snapshotsQuery.isLoading}
      />

      {/* TABLE */}
      <DmsBatchTable
        items={batchesQuery.data?.data ?? []}
        isLoading={batchesQuery.isLoading}
      />

      {/* DIALOGS */}
      <DmsBatchCreateDialog
        show={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        isSubmitting={createBatchMutation.isPending}
        onSubmit={async (payload) => {
          await createBatchMutation.mutateAsync(payload)
          setShowCreateDialog(false)
        }}
      />

      <DmsImportDialog
        show={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        isSubmitting={importBatchMutation.isPending}
        batches={lastDraftBatches}
        onSubmit={async (payload) => {
          const result = await importBatchMutation.mutateAsync(payload)
          setLastImportResult(result)
          setShowImportDialog(false)
        }}
      />
    </Container>
  )
}
