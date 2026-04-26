import { useEffect, useState, type FormEvent } from "react"
import type { ImportErrorRow } from "../../types"
import { formatNumber } from "./import-ui"

export type ImportEditRowPayload = {
  nip: string
  nik: string
  nama: string
  siasnId: string
}

type ImportEditRowModalProps = {
  row: ImportErrorRow | null
  loading: boolean
  error: string | null
  onClose: () => void
  onSubmit: (rowId: string, payload: ImportEditRowPayload) => Promise<void>
}

export function ImportEditRowModal({
  row,
  loading,
  error,
  onClose,
  onSubmit,
}: ImportEditRowModalProps) {
  const [form, setForm] = useState<ImportEditRowPayload>({
    nip: "",
    nik: "",
    nama: "",
    siasnId: "",
  })

  useEffect(() => {
    if (!row) return

    setForm({
      nip: row.nip ?? "",
      nik: row.nik ?? "",
      nama: row.nama ?? "",
      siasnId: row.siasnId ?? "",
    })
  }, [row])

  if (!row) return null

  function updateField(field: keyof ImportEditRowPayload, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!row) {
        return
    }
    await onSubmit(row.id, form)
    }
    
  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      style={{ backgroundColor: "rgba(0,0,0,.35)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title fw-bold text-gray-900">
                  Perbaiki Row Import
                </h3>
                <div className="text-gray-600 fs-7 mt-1">
                  Row{" "}
                  <span className="fw-bold">
                    #{formatNumber(row.rowNumber)}
                  </span>{" "}
                  pada batch staging pegawai.
                </div>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-icon btn-light"
                onClick={onClose}
                disabled={loading}
                aria-label="Tutup modal"
              >
                <i className="ki-duotone ki-cross fs-2">
                  <span className="path1" />
                  <span className="path2" />
                </i>
              </button>
            </div>

            <div className="modal-body">
              {error ? (
                <div className="alert alert-danger d-flex align-items-center p-5 mb-6">
                  <i className="ki-duotone ki-shield-cross fs-2hx text-danger me-4">
                    <span className="path1" />
                    <span className="path2" />
                    <span className="path3" />
                  </i>
                  <div className="d-flex flex-column">
                    <span className="fw-semibold">{error}</span>
                  </div>
                </div>
              ) : null}

              <div className="rounded border border-gray-300 border-dashed bg-light px-5 py-4 mb-6">
                <div className="fw-bold text-gray-900 mb-1">
                  Data saat ini
                </div>
                <div className="text-gray-600 fs-7">
                  NIP: {row.nip ?? "-"} · NIK: {row.nik ?? "-"} · Nama:{" "}
                  {row.nama ?? "-"} · SIASN ID: {row.siasnId ?? "-"}
                </div>
              </div>

              <div className="row g-5">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">NIP</label>
                  <input
                    type="text"
                    className="form-control form-control-solid"
                    value={form.nip}
                    onChange={(event) => updateField("nip", event.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">NIK</label>
                  <input
                    type="text"
                    className="form-control form-control-solid"
                    value={form.nik}
                    onChange={(event) => updateField("nik", event.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="col-md-8">
                  <label className="form-label fw-semibold">Nama</label>
                  <input
                    type="text"
                    className="form-control form-control-solid"
                    value={form.nama}
                    onChange={(event) =>
                      updateField("nama", event.target.value)
                    }
                    disabled={loading}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">SIASN ID</label>
                  <input
                    type="text"
                    className="form-control form-control-solid"
                    value={form.siasnId}
                    onChange={(event) =>
                      updateField("siasnId", event.target.value)
                    }
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}