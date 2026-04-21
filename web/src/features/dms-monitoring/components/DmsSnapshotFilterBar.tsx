import { Button, Card, Col, Form, Row } from "react-bootstrap"

import type { DmsSnapshotFilters, DmsOptionItem } from "../types"

type Props = {
  filters: DmsSnapshotFilters
  limitOptions: DmsOptionItem[]
  kategoriOptions: DmsOptionItem[]
  operatorMode?: boolean
  onChange: (next: DmsSnapshotFilters) => void
  onReset: () => void
}

export function DmsSnapshotFilterBar({
  filters,
  limitOptions,
  kategoriOptions,
  operatorMode = false,
  onChange,
  onReset,
}: Props) {
  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body>
        <Row className="g-3 align-items-end">
          <Col md={operatorMode ? 4 : 3}>
            <Form.Group>
              <Form.Label>Pencarian ASN</Form.Label>
              <Form.Control
                type="text"
                placeholder="Cari NIP atau Nama"
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

          <Col md={operatorMode ? 4 : 3}>
            <Form.Group>
              <Form.Label>Kategori</Form.Label>
              <Form.Select
                value={filters.kategori ?? ""}
                onChange={(event) =>
                  onChange({
                    ...filters,
                    page: 1,
                    kategori: event.target.value,
                  })
                }
              >
                {kategoriOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          {!operatorMode ? (
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
          ) : null}

          {!operatorMode ? (
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
          ) : null}

          <Col md={operatorMode ? 2 : 2}>
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

          <Col md={operatorMode ? 2 : 12}>
            <div
              className={`d-flex ${operatorMode ? "justify-content-md-end" : "justify-content-end"}`}
            >
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
