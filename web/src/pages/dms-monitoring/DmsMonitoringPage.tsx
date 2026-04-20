import { useMemo, useState } from "react"
import { Button, Col, Container, Row, Spinner } from "react-bootstrap"

import type {
  DmsBatchFilters,
  DmsImportResult,
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
  useCreateDmsBatch,
  useDmsBatches,
  useDmsDashboard,
  useImportDmsBatch,
} from "@/features/dms-monitoring"

import {
  DMS_BATCH_LIMIT_OPTIONS,
  DMS_DEFAULT_BATCH_FILTERS,
  DMS_STATUS_OPTIONS,
} from "@/features/dms-monitoring/utils"

export default function DmsMonitoringPage() {
  const [filters, setFilters] = useState<DmsBatchFilters>({
    ...DMS_DEFAULT_BATCH_FILTERS,
  })

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [lastImportResult, setLastImportResult] =
    useState<DmsImportResult | null>(null)

  const batchesQuery = useDmsBatches(filters)

  const dashboardQuery = useDmsDashboard(
    filters.unorId ? { unorId: filters.unorId } : {},
  )

  const createBatchMutation = useCreateDmsBatch()
  const importBatchMutation = useImportDmsBatch()

  const lastDraftBatches = useMemo(
    () => batchesQuery.data?.data ?? [],
    [batchesQuery.data?.data],
  )

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
