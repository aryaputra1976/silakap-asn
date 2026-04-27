import { useMemo, useState, type ChangeEvent } from "react"
import {
  uploadReferenceImportFile,
  type ReferenceImportKind,
  type ReferenceImportResponse,
} from "../api/integrasi.api"

type Notice = {
  type: "success" | "error" | "info"
  message: string
}

type ReferenceImportCard = {
  kind: ReferenceImportKind
  title: string
  description: string
  endpoint: string
}

const CARDS: ReferenceImportCard[] = [
  {
    kind: "jabatan-fungsional",
    title: "Jabatan Fungsional",
    description: "Import referensi jabatan fungsional resmi ke ref_jabatan.",
    endpoint: "/integrasi/import/referensi/jabatan/fungsional",
  },
  {
    kind: "jabatan-pelaksana",
    title: "Jabatan Pelaksana",
    description: "Import referensi jabatan pelaksana resmi ke ref_jabatan.",
    endpoint: "/integrasi/import/referensi/jabatan/pelaksana",
  },
  {
    kind: "jabatan-struktural",
    title: "Jabatan Struktural",
    description: "Import referensi jabatan struktural resmi ke ref_jabatan.",
    endpoint: "/integrasi/import/referensi/jabatan/struktural",
  },
  {
    kind: "unor",
    title: "UNOR",
    description: "Import referensi unit organisasi resmi ke ref_unor.",
    endpoint: "/integrasi/import/referensi/unor",
  },
]

type SelectedFiles = Partial<Record<ReferenceImportKind, File>>
type LoadingMap = Partial<Record<ReferenceImportKind, boolean>>
type ResultMap = Partial<Record<ReferenceImportKind, ReferenceImportResponse>>

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message
  }

  return "Terjadi kesalahan saat import referensi."
}

function isValidExcelFile(file: File): boolean {
  const filename = file.name.toLowerCase()
  return filename.endsWith(".xlsx") || filename.endsWith(".xls")
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value)
}

export default function IntegrasiReferenceImportPage() {
  const [files, setFiles] = useState<SelectedFiles>({})
  const [loading, setLoading] = useState<LoadingMap>({})
  const [results, setResults] = useState<ResultMap>({})
  const [notice, setNotice] = useState<Notice | null>(null)

  const totalCreated = useMemo(
    () =>
      Object.values(results).reduce(
        (acc, item) => acc + (item?.created ?? 0),
        0,
      ),
    [results],
  )

  const totalUpdated = useMemo(
    () =>
      Object.values(results).reduce(
        (acc, item) => acc + (item?.updated ?? 0),
        0,
      ),
    [results],
  )

  const totalSkipped = useMemo(
    () =>
      Object.values(results).reduce(
        (acc, item) => acc + (item?.skipped ?? 0),
        0,
      ),
    [results],
  )

  function handleFileChange(
    kind: ReferenceImportKind,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] ?? null
    setNotice(null)

    if (!file) {
      setFiles((current) => ({
        ...current,
        [kind]: undefined,
      }))
      return
    }

    if (!isValidExcelFile(file)) {
      event.target.value = ""
      setFiles((current) => ({
        ...current,
        [kind]: undefined,
      }))
      setNotice({
        type: "error",
        message: "Format file tidak valid. Gunakan .xlsx atau .xls.",
      })
      return
    }

    setFiles((current) => ({
      ...current,
      [kind]: file,
    }))
  }

  async function handleUpload(kind: ReferenceImportKind) {
    const file = files[kind]

    if (!file) {
      setNotice({
        type: "error",
        message: "Pilih file referensi terlebih dahulu.",
      })
      return
    }

    try {
      setLoading((current) => ({
        ...current,
        [kind]: true,
      }))
      setNotice(null)

      const result = await uploadReferenceImportFile(kind, file)

      setResults((current) => ({
        ...current,
        [kind]: result,
      }))

      setNotice({
        type: "success",
        message: `${result.fileName} berhasil diimport. Created: ${formatNumber(
          result.created,
        )}, Updated: ${formatNumber(result.updated)}, Skipped: ${formatNumber(
          result.skipped,
        )}.`,
      })
    } catch (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(error),
      })
    } finally {
      setLoading((current) => ({
        ...current,
        [kind]: false,
      }))
    }
  }

  return (
    <div className="p-6">
      <div className="card shadow-sm mb-6">
        <div className="card-body p-10">
          <div className="d-flex flex-column flex-lg-row justify-content-between gap-6">
            <div>
              <div className="badge badge-light-primary mb-4">
                Integrasi Eksternal
              </div>
              <h1 className="fw-bold text-gray-900 mb-3">
                Import Referensi Resmi
              </h1>
              <div className="text-gray-600 fs-5">
                Upload referensi Jabatan dan UNOR resmi terlebih dahulu agar
                proses import pegawai bersih, konsisten, dan siap commit.
              </div>
            </div>

            <div className="d-flex flex-wrap gap-3">
              <div className="rounded border border-gray-300 border-dashed px-5 py-4">
                <div className="text-gray-500 fs-8 fw-semibold text-uppercase">
                  Created
                </div>
                <div className="fw-bold fs-2 text-gray-900">
                  {formatNumber(totalCreated)}
                </div>
              </div>
              <div className="rounded border border-gray-300 border-dashed px-5 py-4">
                <div className="text-gray-500 fs-8 fw-semibold text-uppercase">
                  Updated
                </div>
                <div className="fw-bold fs-2 text-gray-900">
                  {formatNumber(totalUpdated)}
                </div>
              </div>
              <div className="rounded border border-gray-300 border-dashed px-5 py-4">
                <div className="text-gray-500 fs-8 fw-semibold text-uppercase">
                  Skipped
                </div>
                <div className="fw-bold fs-2 text-gray-900">
                  {formatNumber(totalSkipped)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {notice ? (
        <div
          className={
            notice.type === "success"
              ? "alert alert-success d-flex align-items-center p-5 mb-6"
              : notice.type === "error"
                ? "alert alert-danger d-flex align-items-center p-5 mb-6"
                : "alert alert-primary d-flex align-items-center p-5 mb-6"
          }
        >
          <div className="fw-semibold">{notice.message}</div>
        </div>
      ) : null}

      <div className="row g-6">
        {CARDS.map((card) => {
          const file = files[card.kind]
          const isLoading = loading[card.kind] === true
          const result = results[card.kind]

          return (
            <div className="col-xl-6" key={card.kind}>
              <div className="card shadow-sm h-100">
                <div className="card-header border-0 pt-6">
                  <div className="card-title flex-column align-items-start">
                    <h3 className="fw-bold text-gray-900 mb-1">
                      {card.title}
                    </h3>
                    <div className="text-gray-600 fs-7">
                      {card.description}
                    </div>
                  </div>

                  <div className="card-toolbar">
                    <span className="badge badge-light">
                      Excel Reference
                    </span>
                  </div>
                </div>

                <div className="card-body pt-2">
                  <div className="rounded border border-gray-300 border-dashed bg-light px-5 py-4 mb-5">
                    <div className="text-gray-500 fs-8 fw-semibold mb-1">
                      Endpoint
                    </div>
                    <div className="fw-semibold text-gray-800 fs-7">
                      {card.endpoint}
                    </div>
                  </div>

                  <div className="rounded border border-gray-300 border-dashed px-5 py-5 mb-5">
                    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4">
                      <div>
                        <div className="fw-bold text-gray-900 fs-6">
                          {file ? file.name : "Belum ada file dipilih"}
                        </div>
                        <div className="text-gray-600 fs-7 mt-1">
                          {file
                            ? `Ukuran file: ${formatNumber(
                                Math.ceil(file.size / 1024),
                              )} KB`
                            : "Pilih file .xlsx atau .xls referensi resmi."}
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        <label className="btn btn-sm btn-light-primary mb-0">
                          Pilih File
                          <input
                            type="file"
                            className="d-none"
                            accept=".xlsx,.xls"
                            disabled={isLoading}
                            onChange={(event) =>
                              handleFileChange(card.kind, event)
                            }
                          />
                        </label>

                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          disabled={!file || isLoading}
                          onClick={() => void handleUpload(card.kind)}
                        >
                          {isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Upload...
                            </>
                          ) : (
                            "Upload"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {result ? (
                    <div className="row g-3">
                      <div className="col-6 col-md-3">
                        <div className="rounded bg-light-success px-4 py-3">
                          <div className="text-gray-600 fs-8">Created</div>
                          <div className="fw-bold text-success fs-5">
                            {formatNumber(result.created)}
                          </div>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="rounded bg-light-primary px-4 py-3">
                          <div className="text-gray-600 fs-8">Updated</div>
                          <div className="fw-bold text-primary fs-5">
                            {formatNumber(result.updated)}
                          </div>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="rounded bg-light-warning px-4 py-3">
                          <div className="text-gray-600 fs-8">Skipped</div>
                          <div className="fw-bold text-warning fs-5">
                            {formatNumber(result.skipped)}
                          </div>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="rounded bg-light-info px-4 py-3">
                          <div className="text-gray-600 fs-8">Valid Rows</div>
                          <div className="fw-bold text-info fs-5">
                            {formatNumber(result.validRows)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 fs-7">
                      Belum ada hasil import untuk kategori ini.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="card shadow-sm mt-6">
        <div className="card-body p-6">
          <div className="fw-bold text-gray-900 mb-2">
            Alur kerja setelah import referensi
          </div>
          <div className="text-gray-600 fs-7">
            Setelah semua referensi resmi berhasil diupload, kembali ke halaman
            Import Data, lalu jalankan validasi ulang batch pegawai. Jika
            Missing References sudah 0 dan Invalid Rows sudah 0, proses commit
            dapat dijalankan.
          </div>
        </div>
      </div>
    </div>
  )
}