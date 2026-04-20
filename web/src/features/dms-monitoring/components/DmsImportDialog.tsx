import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { Button, Form, Modal } from "react-bootstrap"
import { Controller, useForm } from "react-hook-form"

import {
  importDmsBatchSchema,
  type ImportDmsBatchSchema,
} from "../schemas"
import type { DmsBatchItem, ImportDmsBatchPayload } from "../types"
import { DMS_IMPORT_ACCEPT } from "../utils"

type Props = {
  show: boolean
  batches: DmsBatchItem[]
  onClose: () => void
  onSubmit: (payload: ImportDmsBatchPayload) => Promise<void> | void
  isSubmitting?: boolean
}

export function DmsImportDialog({
  show,
  batches,
  onClose,
  onSubmit,
  isSubmitting = false,
}: Props) {
  const form = useForm<ImportDmsBatchSchema>({
    resolver: zodResolver(importDmsBatchSchema),
    defaultValues: {
      batchId: "",
      unorId: "",
      periodeLabel: "",
      catatan: "",
    },
  })

  useEffect(() => {
    if (!show) {
      form.reset()
    }
  }, [show, form])

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      file: values.file,
      batchId: values.batchId || undefined,
      unorId: values.unorId || undefined,
      periodeLabel: values.periodeLabel || undefined,
      catatan: values.catatan || undefined,
    })
  })

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Import Excel DMS</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="d-flex flex-column gap-3">
          <Form.Group>
            <Form.Label>Batch Existing (Opsional)</Form.Label>
            <Form.Select {...form.register("batchId")}>
              <option value="">Buat batch otomatis saat import</option>
              {batches
                .filter((item) => item.status === "DRAFT")
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    #{item.id} - {item.namaFile}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label>File Excel</Form.Label>
            <Controller
              control={form.control}
              name="file"
              render={({ fieldState, field }) => (
                <>
                  <Form.Control
                    type="file"
                    accept={DMS_IMPORT_ACCEPT}
                    isInvalid={Boolean(fieldState.error)}
                    onChange={(event) => {
                    const input = event.target as HTMLInputElement
                    const file = input.files?.[0]
                    field.onChange(file)
                    }}
                  />
                  <Form.Control.Feedback type="invalid">
                    {fieldState.error?.message}
                  </Form.Control.Feedback>
                </>
              )}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>ID Unit Organisasi</Form.Label>
            <Form.Control
              type="text"
              {...form.register("unorId")}
              isInvalid={Boolean(form.formState.errors.unorId)}
              placeholder="Opsional"
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.unorId?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group>
            <Form.Label>Periode</Form.Label>
            <Form.Control
              type="text"
              {...form.register("periodeLabel")}
              isInvalid={Boolean(form.formState.errors.periodeLabel)}
              placeholder="Contoh: Januari 2026"
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.periodeLabel?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group>
            <Form.Label>Catatan</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              {...form.register("catatan")}
              isInvalid={Boolean(form.formState.errors.catatan)}
              placeholder="Catatan tambahan"
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.catatan?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Mengimpor..." : "Mulai Import"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}