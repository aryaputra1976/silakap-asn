import { Button, Card, Col, Form, Row } from "react-bootstrap"

import type { DmsBatchFilters, DmsOptionItem } from "../types"

type Props = {
  filters: DmsBatchFilters
  statusOptions: DmsOptionItem[]
  limitOptions: DmsOptionItem[]
  onChange: (next: DmsBatchFilters) => void
  onReset: () => void
}

export function DmsBatchFilterBar({
  filters,
  statusOptions,
  limitOptions,
  onChange,
  onReset,
}: Props) {
  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body>
        <Row className="g-3 align-items-end">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={filters.status ?? ""}
                onChange={(event) =>
                  onChange({
                    ...filters,
                    page: 1,
                    status: event.target.value as DmsBatchFilters["status"],
                  })
                }
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label>ID Unit Organisasi</Form.Label>
              <Form.Control
                type="text"
                placeholder="Contoh: 12"
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

          <Col md={2}>
            <div className="d-grid">
              <Button variant="outline-secondary" onClick={onReset}>
                Reset
              </Button>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}