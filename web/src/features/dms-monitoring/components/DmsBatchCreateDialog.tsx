import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { Button, Form, Modal } from "react-bootstrap"
import { useForm } from "react-hook-form"

import {
  createDmsBatchSchema,
  type CreateDmsBatchSchema,
} from "../schemas"
import type { CreateDmsBatchPayload } from "../types"

type Props = {
  show: boolean
  onClose: () => void
  onSubmit: (payload: CreateDmsBatchPayload) => Promise<void> | void
  isSubmitting?: boolean
}

export function DmsBatchCreateDialog({
  show,
  onClose,
  onSubmit,
  isSubmitting = false,
}: Props) {
  const form = useForm<CreateDmsBatchSchema>({
    resolver: zodResolver(createDmsBatchSchema),
    defaultValues: {
      namaFile: "",
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
      namaFile: values.namaFile,
      unorId: values.unorId || undefined,
      periodeLabel: values.periodeLabel || undefined,
      catatan: values.catatan || undefined,
    })
  })

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Buat Batch DMS</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="d-flex flex-column gap-3">
          <Form.Group>
            <Form.Label>Nama File Referensi</Form.Label>
            <Form.Control
              type="text"
              {...form.register("namaFile")}
              isInvalid={Boolean(form.formState.errors.namaFile)}
              placeholder="Contoh: dms-pegawai-januari-2026.xlsx"
            />
            <Form.Control.Feedback type="invalid">
              {form.formState.errors.namaFile?.message}
            </Form.Control.Feedback>
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
            {isSubmitting ? "Menyimpan..." : "Simpan Batch"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}