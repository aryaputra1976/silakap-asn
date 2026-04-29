import { type ChangeEvent, type FormEvent, useState } from "react"

import { peremajaanSchema } from "../schema"

type PeremajaanFormState = {
  nip: string
  jenisPerubahan: string
  nilaiBaru: string
  keterangan: string
}

type PeremajaanSubmitData = PeremajaanFormState & {
  documents: Record<string, File | null>
}

interface Props {
  onSubmit: (data: PeremajaanSubmitData) => Promise<void> | void
  loading?: boolean
}

const INITIAL_FORM: PeremajaanFormState = {
  nip: "",
  jenisPerubahan: "",
  nilaiBaru: "",
  keterangan: "",
}

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
]

const MAX_FILE_SIZE = 5 * 1024 * 1024

export default function PeremajaanForm({
  onSubmit,
  loading = false,
}: Props) {
  const [form, setForm] =
    useState<PeremajaanFormState>(INITIAL_FORM)
  const [documents, setDocuments] =
    useState<Record<string, File | null>>({})

  function updateForm<K extends keyof PeremajaanFormState>(
    key: K,
    value: PeremajaanFormState[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  function handleFileChange(
    code: string,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] ?? null

    if (!file) {
      return
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      alert("Format file harus PDF, JPG, atau PNG")
      event.target.value = ""
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("Ukuran file maksimal 5MB")
      event.target.value = ""
      return
    }

    setDocuments((prev) => ({
      ...prev,
      [code]: file,
    }))
  }

  function removeFile(code: string) {
    setDocuments((prev) => ({
      ...prev,
      [code]: null,
    }))
  }

  function validate() {
    if (!form.nip.trim()) {
      alert("NIP Pegawai wajib diisi")
      return false
    }

    if (!form.jenisPerubahan) {
      alert("Data yang Diubah wajib dipilih")
      return false
    }

    if (!form.nilaiBaru.trim()) {
      alert("Nilai Baru wajib diisi")
      return false
    }

    for (const doc of peremajaanSchema.documents ?? []) {
      if (doc.required && !documents[doc.code]) {
        alert(`${doc.label} wajib diupload`)
        return false
      }
    }

    return true
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validate()) {
      return
    }

    void onSubmit({
      nip: form.nip.trim(),
      jenisPerubahan: form.jenisPerubahan,
      nilaiBaru: form.nilaiBaru.trim(),
      keterangan: form.keterangan.trim(),
      documents,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-6">
        <div className="col-12">
          <div className="d-flex flex-column gap-1 mb-2">
            <div className="fw-bolder text-gray-900 fs-5">
              Informasi ASN
            </div>
            <div className="text-muted fs-7">
              Pilih pegawai dan tentukan data identitas yang akan diperbarui.
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <label className="form-label fw-semibold">
            NIP Pegawai <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control form-control-lg form-control-solid"
            value={form.nip}
            onChange={(event) =>
              updateForm("nip", event.target.value)
            }
            placeholder="Masukkan NIP pegawai"
            disabled={loading}
          />
        </div>

        <div className="col-12 col-lg-6">
          <label className="form-label fw-semibold">
            Data yang Diubah <span className="text-danger">*</span>
          </label>
          <select
            className="form-select form-select-lg form-select-solid"
            value={form.jenisPerubahan}
            onChange={(event) =>
              updateForm("jenisPerubahan", event.target.value)
            }
            disabled={loading}
          >
            <option value="">Pilih data</option>
            {peremajaanSchema.fields
              .find((field) => field.name === "jenisPerubahan")
              ?.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </select>
        </div>

        <div className="col-12 col-lg-6">
          <label className="form-label fw-semibold">
            Nilai Baru <span className="text-danger">*</span>
          </label>
          <input
            type={
              form.jenisPerubahan === "TANGGAL_LAHIR"
                ? "date"
                : "text"
            }
            className="form-control form-control-lg form-control-solid"
            value={form.nilaiBaru}
            onChange={(event) =>
              updateForm("nilaiBaru", event.target.value)
            }
            placeholder="Masukkan nilai baru"
            disabled={loading}
          />
        </div>

        <div className="col-12">
          <label className="form-label fw-semibold">
            Alasan / Keterangan
          </label>
          <textarea
            className="form-control form-control-lg form-control-solid"
            rows={4}
            value={form.keterangan}
            onChange={(event) =>
              updateForm("keterangan", event.target.value)
            }
            placeholder="Tuliskan alasan perubahan data"
            disabled={loading}
          />
        </div>

        <div className="col-12">
          <div className="separator separator-dashed my-2" />
        </div>

        <div className="col-12">
          <div className="d-flex flex-column gap-1 mb-2">
            <div className="fw-bolder text-gray-900 fs-5">
              Dokumen Persyaratan
            </div>
            <div className="text-muted fs-7">
              Unggah berkas pendukung dalam format PDF, JPG, atau PNG.
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr className="fw-bold text-muted">
                  <th>Dokumen</th>
                  <th>File</th>
                  <th className="text-end">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {(peremajaanSchema.documents ?? []).map((doc) => {
                  const file = documents[doc.code]

                  return (
                    <tr key={doc.code}>
                      <td>
                        <div className="fw-semibold text-gray-900">
                          {doc.label}
                          {doc.required ? (
                            <span className="text-danger ms-1">*</span>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        {file ? (
                          <span className="badge badge-light-success">
                            {file.name}
                          </span>
                        ) : (
                          <span className="text-muted fs-7">
                            Belum upload
                          </span>
                        )}
                      </td>
                      <td className="text-end">
                        {file ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-light-danger"
                            onClick={() => removeFile(doc.code)}
                            disabled={loading}
                          >
                            Hapus
                          </button>
                        ) : (
                          <label className="btn btn-sm btn-light-primary mb-0">
                            Pilih File
                            <input
                              type="file"
                              className="d-none"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(event) =>
                                handleFileChange(doc.code, event)
                              }
                              disabled={loading}
                            />
                          </label>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-3 mt-8">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan Usulan"}
        </button>
      </div>
    </form>
  )
}
