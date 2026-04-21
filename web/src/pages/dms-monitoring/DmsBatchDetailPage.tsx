import { useMemo, useState } from "react"
import { Button, Col, Container, Row, Spinner } from "react-bootstrap"
import { Link, useParams } from "react-router-dom"

import type { DmsSnapshotFilters } from "@/features/dms-monitoring"
import {
  DmsBatchStatusBadge,
  DmsDashboardDokumenStats,
  DmsDashboardKategoriChart,
  DmsSnapshotFilterBar,
  DmsSnapshotTable,
  useDmsBatchDetail,
  useDmsBatchSummary,
  useDmsSnapshots,
} from "@/features/dms-monitoring"
import {
  DMS_DEFAULT_SNAPSHOT_FILTERS,
  DMS_KATEGORI_OPTIONS,
  DMS_SNAPSHOT_LIMIT_OPTIONS,
  formatDmsDateTime,
} from "@/features/dms-monitoring/utils"

export default function DmsBatchDetailPage() {
  const params = useParams<{ id: string }>()
  const batchId = params.id ?? ""

  const [filters, setFilters] = useState<DmsSnapshotFilters>({
    ...DMS_DEFAULT_SNAPSHOT_FILTERS,
    batchId,
  })

  const batchQuery = useDmsBatchDetail(batchId)
  const summaryQuery = useDmsBatchSummary(batchId)
  const snapshotsQuery = useDmsSnapshots(filters)

  const resetFilters = useMemo(
    () => () =>
      setFilters({
        ...DMS_DEFAULT_SNAPSHOT_FILTERS,
        batchId,
      }),
    [batchId],
  )

  return (
    <Container fluid className="py-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="mb-2">
            <Link
              to="/dms-monitoring"
              className="btn btn-outline-secondary btn-sm"
            >
              Kembali
            </Link>
          </div>
          <h3 className="mb-1">Detail Batch DMS</h3>
          <p className="text-muted mb-0">
            Ringkasan hasil import, statistik dokumen, dan snapshot ASN.
          </p>
        </div>
      </div>

      {batchQuery.isLoading ? (
        <div className="d-flex align-items-center justify-content-center py-5">
          <Spinner />
        </div>
      ) : batchQuery.data ? (
        <div className="border rounded-3 bg-white shadow-sm p-4 mb-4">
          <Row className="g-3">
            <Col md={4}>
              <div className="text-muted small mb-1">Nama File</div>
              <div className="fw-semibold">
                {batchQuery.data.namaFile}
              </div>
            </Col>

            <Col md={2}>
              <div className="text-muted small mb-1">Status</div>
              <DmsBatchStatusBadge status={batchQuery.data.status} />
            </Col>

            <Col md={3}>
              <div className="text-muted small mb-1">Periode</div>
              <div>{batchQuery.data.periodeLabel ?? "-"}</div>
            </Col>

            <Col md={3}>
              <div className="text-muted small mb-1">Unit Organisasi</div>
              <div>{batchQuery.data.unorNama ?? "-"}</div>
            </Col>

            <Col md={3}>
              <div className="text-muted small mb-1">Importir</div>
              <div>{batchQuery.data.importedByUsername ?? "-"}</div>
            </Col>

            <Col md={3}>
              <div className="text-muted small mb-1">Imported At</div>
              <div>{formatDmsDateTime(batchQuery.data.importedAt)}</div>
            </Col>

            <Col md={6}>
              <div className="text-muted small mb-1">Catatan</div>
              <div>{batchQuery.data.catatan ?? "-"}</div>
            </Col>
          </Row>
        </div>
      ) : null}

      <Row className="g-4 mb-4">
        <Col lg={5}>
          {summaryQuery.data ? (
            <DmsDashboardKategoriChart
              items={summaryQuery.data.byKategori}
            />
          ) : null}
        </Col>

        <Col lg={7}>
          {summaryQuery.data ? (
            <DmsDashboardDokumenStats
              stats={summaryQuery.data.dokumenStats}
              totalAsn={summaryQuery.data.summary.totalAsn}
            />
          ) : null}
        </Col>
      </Row>

      <DmsSnapshotFilterBar
        filters={filters}
        limitOptions={DMS_SNAPSHOT_LIMIT_OPTIONS}
        kategoriOptions={DMS_KATEGORI_OPTIONS}
        onChange={(next) =>
          setFilters({
            batchId: next.batchId ?? batchId,
            page: next.page ?? 1,
            limit: next.limit ?? 10,
            unorId: next.unorId ?? "",
            kategori: next.kategori ?? "",
            nip: next.nip ?? "",
          })
        }
        onReset={resetFilters}
      />

      <DmsSnapshotTable
        items={snapshotsQuery.data?.data ?? []}
        isLoading={snapshotsQuery.isLoading}
      />
    </Container>
  )
}
