import { useMemo, useRef, useState, type ChangeEvent } from "react"
import { KTIcon } from "@/_metronic/helpers"
import { ImportStatCard } from "../components/import/ImportStatCard"
import {
  REFERENCE_IMPORT_CONFIGS,
  uploadReferenceImportFile,
  type ReferenceImportKind,
  type ReferenceImportResponse,
} from "../api/integrasi.api"

type Notice = {
  type: "success" | "error" | "info"
  message: string
}

type SelectedFiles = Partial<Record<ReferenceImportKind, File>>
type LoadingMap = Partial<Record<ReferenceImportKind, boolean>>
type ResultMap = Partial<Record<ReferenceImportKind, ReferenceImportResponse>>

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message

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

function formatFileSize(file: File): string {
  const sizeKb = Math.max(1, Math.round(file.size / 1024))
  return `${sizeKb.toLocaleString("id-ID")} KB`
}

function ReferenceImportPageHeader() {
  return (
    <div className="card mb-5 mb-xl-8 bg-primary bg-opacity-90">
      <div
        className="card-body py-10 px-9"
        style={{
          background:
            "linear-gradient(135deg, #2554d9 0%, #101a34 100%)",
          borderRadius: "0.75rem",
        }}
      >
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-6">
          <div>
            <h1 className="fw-bold text-white mb-4">
              Import Referensi Resmi
            </h1>

            <div className="text-white-75 fs-5 fw-semibold mw-850px lh-lg">
              Upload referensi Jabatan dan UNOR resmi sebelum validasi import
              pegawai agar data bersih, konsisten, dan siap commit.
            </div>

            <div className="d-flex flex-wrap gap-3 mt-6">
              <span className="badge badge-light-primary fs-7 py-3 px-4">
                Upload Referensi
              </span>
              <span className="badge badge-light-warning fs-7 py-3 px-4">
                Validasi Ulang
              </span>
              <span className="badge badge-light-success fs-7 py-3 px-4">
                Siap Commit
              </span>
            </div>
          </div>

          <div className="symbol symbol-100px symbol-lg-125px">
            <div className="symbol-label bg-white bg-opacity-10">
              <KTIcon iconName="file-up" className="fs-3x text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function IntegrasiReferenceImportPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [activeKind, setActiveKind] =
    useState<ReferenceImportKind>("jabatan-fungsional")
  const [files, setFiles] = useState<SelectedFiles>({})
  const [loading, setLoading] = useState<LoadingMap>({})
  const [results, setResults] = useState<ResultMap>({})
  const [notice, setNotice] = useState<Notice | null>(null)

  const activeOption =
    REFERENCE_IMPORT_CONFIGS.find((item) => item.kind === activeKind) ??
    REFERENCE_IMPORT_CONFIGS[0]

  const activeFile = files[activeKind] ?? null
  const activeResult = results[activeKind] ?? null
  const activeLoading = loading[activeKind] === true

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

  const totalValidRows = useMemo(
    () =>
      Object.values(results).reduce(
        (acc, item) => acc + (item?.validRows ?? 0),
        0,
      ),
    [results],
  )

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setNotice(null)

    if (!file) {
      setFiles((current) => ({
        ...current,
        [activeKind]: undefined,
      }))
      return
    }

    if (!isValidExcelFile(file)) {
      event.target.value = ""
      setFiles((current) => ({
        ...current,
        [activeKind]: undefined,
      }))
      setNotice({
        type: "error",
        message: "Format file tidak valid. Gunakan .xlsx atau .xls.",
      })
      return
    }

    setFiles((current) => ({
      ...current,
      [activeKind]: file,
    }))
  }

  async function handleUpload() {
    if (!activeFile) {
      setNotice({
        type: "error",
        message: "Pilih file referensi terlebih dahulu.",
      })
      return
    }

    try {
      setLoading((current) => ({
        ...current,
        [activeKind]: true,
      }))
      setNotice(null)

      const result = await uploadReferenceImportFile(activeKind, activeFile)

      setResults((current) => ({
        ...current,
        [activeKind]: result,
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
        [activeKind]: false,
      }))
    }
  }

  return (
    <>
      <ReferenceImportPageHeader />

      <div className="row g-5 g-xl-8 mb-5 mb-xl-8">
        <div className="col-xl-3">
          <ImportStatCard
            label="Created"
            value={totalCreated}
            helper="Referensi baru dibuat"
            tone="success"
          />
        </div>
        <div className="col-xl-3">
          <ImportStatCard
            label="Updated"
            value={totalUpdated}
            helper="Referensi diperbarui"
            tone="info"
          />
        </div>
        <div className="col-xl-3">
          <ImportStatCard
            label="Skipped"
            value={totalSkipped}
            helper="Data dilewati"
            tone="warning"
          />
        </div>
        <div className="col-xl-3">
          <ImportStatCard
            label="Valid Rows"
            value={totalValidRows}
            helper="Baris valid diproses"
            tone="default"
          />
        </div>
      </div>

      {notice ? (
        <div
          className={`alert ${
            notice.type === "success"
              ? "alert-success"
              : notice.type === "error"
                ? "alert-danger"
                : "alert-primary"
          } d-flex align-items-center p-5 mb-5`}
        >
          <KTIcon
            iconName={
              notice.type === "success"
                ? "check-circle"
                : notice.type === "error"
                  ? "cross-circle"
                  : "information-5"
            }
            className="fs-2hx me-4"
          />
          <div className="fw-semibold">{notice.message}</div>
        </div>
      ) : null}

      <div className="card mb-5 mb-xl-8">
        <div className="card-header border-0 pt-6">
          <div className="card-toolbar">
            <ul className="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bold">
              {REFERENCE_IMPORT_CONFIGS.map((option) => (
                <li className="nav-item" key={option.kind}>
                  <button
                    type="button"
                    className={`nav-link text-active-primary py-5 me-6 bg-transparent border-0 ${
                      activeKind === option.kind ? "active" : ""
                    }`}
                    onClick={() => {
                      setActiveKind(option.kind)
                      setNotice(null)
                    }}
                  >
                    {option.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card-body pt-4">
          <div className="row g-5 g-xl-8">
            <div className="col-xl-7">
              <div className="card card-flush border h-100">
                <div className="card-header">
                  <div className="card-title">
                    <div>
                      <h3 className="fw-bold text-gray-900 mb-1">
                        Upload File Referensi
                      </h3>
                      <div className="text-muted fw-semibold fs-7">
                        Format yang didukung: .xlsx atau .xls
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  <div className="border border-dashed border-gray-300 rounded p-8 text-center bg-light-primary">
                    <KTIcon
                      iconName="file-up"
                      className="fs-3x text-primary mb-5"
                    />

                    <div className="fw-bold text-gray-900 fs-5 mb-2">
                      {activeOption.title}
                    </div>

                    <div className="text-gray-600 fw-semibold mb-2">
                      {activeFile ? activeFile.name : activeOption.helper}
                    </div>

                    <div className="text-muted fs-7 mb-6">
                      {activeFile ? formatFileSize(activeFile) : ".xlsx .xls"}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      className="d-none"
                      onChange={handleFileChange}
                      disabled={activeLoading}
                    />

                    <div className="d-flex justify-content-center gap-3">
                      <button
                        type="button"
                        className="btn btn-light-primary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={activeLoading}
                      >
                        <KTIcon iconName="folder-up" className="fs-4 me-2" />
                        Pilih File
                      </button>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => void handleUpload()}
                        disabled={!activeFile || activeLoading}
                      >
                        {activeLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Mengupload...
                          </>
                        ) : (
                          <>
                            <KTIcon iconName="file-up" className="fs-4 me-2" />
                            Upload File
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="notice d-flex bg-light-primary rounded border-primary border border-dashed p-6 mt-6">
                    <KTIcon
                      iconName="information-5"
                      className="fs-2tx text-primary me-4"
                    />
                    <div>
                      <div className="fw-bold text-gray-900 mb-1">
                        {activeOption.title}
                      </div>
                      <div className="text-gray-700 fw-semibold mb-3">
                        {activeOption.description}
                      </div>
                      <div className="text-muted fs-7">
                        Endpoint:{" "}
                        <code className="bg-white rounded px-2 py-1">
                          {activeOption.endpoint}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-5">
              <div className="card card-flush border h-100">
                <div className="card-header">
                  <div className="card-title">
                    <h3 className="fw-bold text-gray-900 mb-0">
                      Hasil Import
                    </h3>
                  </div>
                  <div className="card-toolbar">
                    <span className="badge badge-light">
                      {activeResult ? "Sudah import" : "Belum ada import"}
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  {activeResult ? (
                    <>
                      <div className="d-flex align-items-center mb-6">
                        <div className="symbol symbol-50px me-4">
                          <span className="symbol-label bg-light-success">
                            <KTIcon
                              iconName="check"
                              className="fs-2x text-success"
                            />
                          </span>
                        </div>
                        <div>
                          <div className="fw-bold text-gray-900">
                            {activeResult.fileName}
                          </div>
                          <div className="text-muted fw-semibold fs-7">
                            Total row: {formatNumber(activeResult.totalRows)} -
                            Valid: {formatNumber(activeResult.validRows)}
                          </div>
                        </div>
                      </div>

                      <div className="separator separator-dashed mb-5" />

                      <div className="d-flex justify-content-between py-3">
                        <span className="text-gray-600 fw-semibold">
                          Total Rows
                        </span>
                        <span className="fw-bold text-gray-900">
                          {formatNumber(activeResult.totalRows)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between py-3">
                        <span className="text-gray-600 fw-semibold">
                          Valid Rows
                        </span>
                        <span className="fw-bold text-gray-900">
                          {formatNumber(activeResult.validRows)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between py-3">
                        <span className="text-gray-600 fw-semibold">
                          Created
                        </span>
                        <span className="fw-bold text-success">
                          {formatNumber(activeResult.created)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between py-3">
                        <span className="text-gray-600 fw-semibold">
                          Updated
                        </span>
                        <span className="fw-bold text-primary">
                          {formatNumber(activeResult.updated)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between py-3">
                        <span className="text-gray-600 fw-semibold">
                          Skipped
                        </span>
                        <span className="fw-bold text-warning">
                          {formatNumber(activeResult.skipped)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="symbol symbol-75px mb-5">
                        <span className="symbol-label bg-light-primary">
                          <KTIcon
                            iconName="file"
                            className="fs-3x text-primary"
                          />
                        </span>
                      </div>
                      <div className="fw-bold text-gray-900 fs-5 mb-2">
                        Belum ada hasil import
                      </div>
                      <div className="text-muted fw-semibold">
                        Upload file referensi untuk melihat ringkasan hasil
                        import.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="notice d-flex bg-light-info rounded border-info border border-dashed p-6 mt-8">
            <KTIcon iconName="route" className="fs-2tx text-info me-4" />
            <div className="d-flex flex-stack flex-grow-1">
              <div>
                <div className="fw-bold text-gray-900 mb-1">
                  Alur kerja setelah import referensi
                </div>
                <div className="text-gray-700 fw-semibold">
                  Setelah semua referensi resmi diupload, kembali ke Import Data
                  Pegawai lalu jalankan validasi ulang batch.
                </div>
              </div>

              <a href="/integrasi/import" className="btn btn-sm btn-light-info">
                Buka Import Data Pegawai
                <KTIcon iconName="arrow-right" className="fs-4 ms-2" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
