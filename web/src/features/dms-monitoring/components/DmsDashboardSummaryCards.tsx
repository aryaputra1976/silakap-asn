import { Card, Col, Row } from "react-bootstrap"

import type { DmsBatchSummaryAggregate } from "../types"
import {
  formatDmsDateTime,
  formatDmsDecimal,
  formatDmsNumber,
} from "../utils"

type Props = {
  summary: DmsBatchSummaryAggregate
}

export function DmsDashboardSummaryCards({ summary }: Props) {
  const cards = [
    {
      title: "Total ASN Snapshot",
      value: formatDmsNumber(summary.totalAsn),
    },
    {
      title: "Matched Pegawai",
      value: formatDmsNumber(summary.matchedPegawai),
    },
    {
      title: "Matched Unit",
      value: formatDmsNumber(summary.matchedUnor),
    },
    {
      title: "Rata-rata Skor Arsip",
      value: formatDmsDecimal(summary.avgSkorArsip),
    },
  ]

  return (
    <Row className="g-3">
      {cards.map((card) => (
        <Col md={6} xl={3} key={card.title}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="text-muted small mb-2">{card.title}</div>
              <div className="fs-4 fw-bold">{card.value}</div>
            </Card.Body>
          </Card>
        </Col>
      ))}

      <Col xs={12}>
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="text-muted small mb-1">Sinkronisasi Terakhir</div>
            <div className="fw-semibold">
              {formatDmsDateTime(summary.latestSync)}
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}