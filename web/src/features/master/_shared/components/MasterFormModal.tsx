import { useEffect, useState, useMemo } from "react"
import { KTIcon } from "@/_metronic/helpers"
import type { MasterEntity, CreateMasterPayload } from "../types"

type Props = {
  show: boolean
  initialData?: MasterEntity | null
  loading?: boolean
  canCreate?: boolean
  canUpdate?: boolean
  onClose: () => void
  onSubmit: (payload: CreateMasterPayload) => Promise<void>
  title: string
}

export function MasterFormModal({
  show,
  initialData,
  loading = false,
  canCreate = false,
  canUpdate = false,
  onClose,
  onSubmit,
  title,
}: Props) {
  const isEdit = Boolean(initialData)

  // ================= PERMISSION CHECK =================
  const canSubmit = isEdit ? canUpdate : canCreate

  const [form, setForm] = useState<CreateMasterPayload>({
    kode: "",
    nama: "",
  })

  const [submitting, setSubmitting] = useState(false)

  // ================= INIT =================
  useEffect(() => {
    if (initialData) {
      setForm({
        kode: initialData.kode,
        nama: initialData.nama,
      })
    } else {
      setForm({
        kode: "",
        nama: "",
      })
    }
  }, [initialData, show])

  // ================= VALIDATION =================
  const isValid = useMemo(() => {
    return form.kode.trim().length > 0 && form.nama.trim().length > 0
  }, [form])

  // ================= HANDLER =================
  const handleChange = (key: keyof CreateMasterPayload, value: string) => {
    if (!canSubmit) return

    setForm((prev) => ({
      ...prev,
      [key]:
        key === "kode"
          ? value.toUpperCase().trim()
          : value,
    }))
  }

  const handleSubmit = async () => {
    if (!isValid || submitting || !canSubmit) return

    try {
      setSubmitting(true)
      await onSubmit({
        kode: form.kode.trim(),
        nama: form.nama.trim(),
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!show) return null

  return (
    <div className="modal fade show d-block">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg">

          {/* HEADER */}
          <div className="modal-header">
            <h2 className="fw-bold">
              {isEdit ? `Edit ${title}` : `Tambah ${title}`}
            </h2>

            <button
              type="button"
              className="btn btn-sm btn-icon btn-active-light-primary"
              onClick={onClose}
            >
              <KTIcon iconName="cross" className="fs-2" />
            </button>
          </div>

          {/* BODY */}
          <div className="modal-body py-8 px-10">

            {/* KODE */}
            <div className="fv-row mb-7">
              <label
                htmlFor="master-form-kode"
                className="required form-label fw-semibold fs-6"
              >
                Kode
              </label>

              <input
                id="master-form-kode"
                type="text"
                className="form-control form-control-solid"
                value={form.kode}
                onChange={(e) =>
                  handleChange("kode", e.target.value)
                }
                disabled={isEdit || !canSubmit}
              />
            </div>

            {/* NAMA */}
            <div className="fv-row mb-7">
              <label
                htmlFor="master-form-nama"
                className="required form-label fw-semibold fs-6"
              >
                Nama
              </label>

              <input
                id="master-form-nama"
                type="text"
                className="form-control form-control-solid"
                value={form.nama}
                onChange={(e) =>
                  handleChange("nama", e.target.value)
                }
                disabled={!canSubmit}
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="modal-footer flex-center">
            <button
              type="button"
              className="btn btn-light me-3"
              onClick={onClose}
              disabled={submitting}
            >
              Batal
            </button>

            {canSubmit && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={!isValid || loading || submitting}
              >
                {!loading && !submitting && "Simpan"}
                {(loading || submitting) && (
                  <>
                    Menyimpan...
                    <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
