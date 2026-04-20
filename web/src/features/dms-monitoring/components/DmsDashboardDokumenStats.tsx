import { Card, Col, ProgressBar, Row } from "react-bootstrap"

import type { DmsDokumenStats } from "../types"
import { formatDmsNumber } from "../utils"

type Props = {
  stats: DmsDokumenStats
  totalAsn: number
}

export function DmsDashboardDokumenStats({
  stats,
  totalAsn,
}: Props) {
  const items = [
    { key: "drh", label: "DRH", value: stats.drh },
    { key: "cpns", label: "CPNS", value: stats.cpns },
    { key: "d2np", label: "D2NP", value: stats.d2np },
    { key: "spmt", label: "SPMT", value: stats.spmt },
    { key: "pns", label: "PNS", value: stats.pns },
  ]

  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="bg-white border-0">
        <h6 className="mb-0">Statistik Kelengkapan Dokumen</h6>
      </Card.Header>
      <Card.Body>
        <Row className="g-3">
          {items.map((item) => {
            const percent =
              totalAsn > 0 ? (item.value / totalAsn) * 100 : 0

            return (
              <Col md={6} key={item.key}>
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-medium">{item.label}</span>
                  <span>{formatDmsNumber(item.value)}</span>
                </div>
                <ProgressBar now={percent} />
              </Col>
            )
          })}
        </Row>
      </Card.Body>
    </Card>
  )
}