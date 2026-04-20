import { Button, Card, Col, Form, Row } from "react-bootstrap"

import type { DmsSnapshotFilters, DmsOptionItem } from "../types"

type Props = {
  filters: DmsSnapshotFilters
  limitOptions: DmsOptionItem[]
  onChange: (next: DmsSnapshotFilters) => void
  onReset: () => void
}

export function DmsSnapshotFilterBar({
  filters,
  limitOptions,
  onChange,
  onReset,
}: Props) {
  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body>
        <Row className="g-3 align-items-end">
          <Col md={3}>
            <Form.Group>
              <Form.Label>NIP</Form.Label>
              <Form.Control
                type="text"
                placeholder="Cari NIP"
                value={filters.nip ?? ""}
                onChange={(event) =>
                  onChange({
                    ...filters,
                    page: 1,
                    nip: event.target.value,
                  })
                }
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label>Kategori</Form.Label>
              <Form.Control
                type="text"
                placeholder="Kategori kelengkapan"
                value={filters.kategori ?? ""}
                onChange={(event) =>
                  onChange({
                    ...filters,
                    page: 1,
                    kategori: event.target.value,
                  })
                }
              />
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group>
              <Form.Label>ID Batch</Form.Label>
              <Form.Control
                type="text"
                placeholder="ID batch"
                value={filters.batchId ?? ""}
                onChange={(event) =>
                  onChange({
                    ...filters,
                    page: 1,
                    batchId: event.target.value,
                  })
                }
              />
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group>
              <Form.Label>ID Unit</Form.Label>
              <Form.Control
                type="text"
                placeholder="ID unit"
                value={filters.unorId ?? ""}
                onChange={(event) =>
                  onChange({
                    ...filters,
                    page: 1,
                    unorId: event.target.value,
                  })
                }
              />
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group>
              <Form.Label>Limit</Form.Label>
              <Form.Select
                value={String(filters.limit ?? 10)}
                onChange={(event) =>
                  onChange({
                    ...filters,
                    page: 1,
                    limit: Number(event.target.value),
                  })
                }
              >
                {limitOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12}>
            <div className="d-flex justify-content-end">
              <Button variant="outline-secondary" onClick={onReset}>
                Reset Filter
              </Button>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}