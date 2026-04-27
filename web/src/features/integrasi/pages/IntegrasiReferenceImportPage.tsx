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

type ReferenceImportOption = {
  kind: ReferenceImportKind
  title: string
  shortTitle: string
  description: string
  endpoint: string
  helper: string
}

const OPTIONS: ReferenceImportOption[] = [
  {
    kind: "jabatan-fungsional",
    title: "Jabatan Fungsional",
    shortTitle: "Fungsional",
    description: "Referensi jabatan fungsional resmi untuk master ref_jabatan.",
    endpoint: "/integrasi/import/referensi/jabatan/fungsional",
    helper: "Gunakan file Referensi-Jabatan-Fungsional.xlsx.",
  },
  {
    kind: "jabatan-pelaksana",
    title: "Jabatan Pelaksana",
    shortTitle: "Pelaksana",
    description: "Referensi jabatan pelaksana resmi untuk master ref_jabatan.",
    endpoint: "/integrasi/import/referensi/jabatan/pelaksana",
    helper: "Gunakan file Referensi-Jabatan-Pelaksana.xlsx.",
  },
  {
    kind: "jabatan-struktural",
    title: "Jabatan Struktural",
    shortTitle: "Struktural",
    description: "Referensi jabatan struktural resmi untuk master ref_jabatan.",
    endpoint: "/integrasi/import/referensi/jabatan/struktural",
    helper: "Gunakan file Referensi-Jabatan-Struktural.xlsx.",
  },
  {
    kind: "unor",
    title: "UNOR",
    shortTitle: "UNOR",
    description: "Referensi unit organisasi resmi untuk master ref_unor.",
    endpoint: "/integrasi/import/referensi/unor",
    helper: "Gunakan file Referensi-unor.xlsx.",
  },
]

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

function formatFileSize(size: number): string {
  return `${formatNumber(Math.ceil(size / 1024))} KB`
}

export default function IntegrasiReferenceImportPage() {
  const [activeKind, setActiveKind] =
    useState<ReferenceImportKind>("jabatan-fungsional")
  const [files, setFiles] = useState<SelectedFiles>({})
  const [loading, setLoading] = useState<LoadingMap>({})
  const [results, setResults] = useState<ResultMap>({})
  const [notice, setNotice] = useState<Notice | null>(null)

  const activeOption = OPTIONS.find((item) => item.kind === activeKind) ?? OPTIONS[0]
  const activeFile = files[activeKind] ?? null
  const activeResult = results[activeKind] ?? null
  const activeLoading = loading[activeKind] === true

  const totalCreated = useMemo(
    () => Object.values(results).reduce((acc, item) => acc + (item?.created ?? 0), 0),
    [results],
  )

  const totalUpdated = useMemo(
    () => Object.values(results).reduce((acc, item) => acc + (item?.updated ?? 0), 0),
    [results],
  )

  const totalSkipped = useMemo(
    () => Object.values(results).reduce((acc, item) => acc + (item?.skipped ?? 0), 0),
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
    <div className="space-y-6 p-6">
      <div className="card border-0 shadow-sm mb-7 overflow-hidden">
        <div
          className="px-6 px-lg-8 py-6"
          style={{
            background:
              "linear-gradient(135deg, #1d4ed8 0%, #16224a 52%, #0f172a 100%)",
          }}
        >
          <div className="d-flex align-items-start justify-content-between gap-4">
            <div className="flex-grow-1">
              <div className="text-white fw-bolder fs-2 mb-2">
                Import Referensi Resmi
              </div>

              <div className="text-white opacity-75 fs-6 lh-lg">
                Upload referensi Jabatan dan UNOR resmi sebelum validasi import
                pegawai agar data bersih, konsisten, dan siap commit.
              </div>

              <div className="d-flex flex-wrap gap-2 mt-4">
                {OPTIONS.map((option) => (
                  <button
                    key={option.kind}
                    type="button"
                    className={
                      option.kind === activeKind
                        ? "badge badge-light-primary border-0"
                        : "badge badge-light border-0"
                    }
                    disabled={activeLoading}
                    onClick={() => {
                      setActiveKind(option.kind)
                      setNotice(null)
                    }}
                  >
                    {option.shortTitle}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {notice ? (
        <div
          className={
            notice.type === "success"
              ? "alert alert-success d-flex align-items-center p-5 mb-0"
              : notice.type === "error"
                ? "alert alert-danger d-flex align-items-center p-5 mb-0"
                : "alert alert-primary d-flex align-items-center p-5 mb-0"
          }
        >
          <div className="fw-semibold">{notice.message}</div>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="card shadow-sm h-100">
          <div className="card-header border-0 pt-6">
            <div className="card-title flex-column align-items-start">
              <h3 className="fw-bold text-gray-900 mb-1">
                Upload File Referensi
              </h3>
              <div className="text-gray-600 fs-7">
                Format yang didukung: .xlsx atau .xls
              </div>
            </div>

            <div className="card-toolbar">
              <span className="badge badge-light-primary">
                {activeOption.title}
              </span>
            </div>
          </div>

          <div className="card-body pt-2">
            <div className="rounded border border-gray-300 border-dashed px-5 py-5 mb-5">
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4">
                <div className="d-flex align-items-center gap-4">
                  <div className="symbol symbol-60px">
                    <div className="symbol-label bg-light-primary">
                      <i className="ki-duotone ki-file-up fs-2x text-primary">
                        <span className="path1" />
                        <span className="path2" />
                      </i>
                    </div>
                  </div>

                  <div>
                    <div className="fw-bold text-gray-900 fs-5 mb-1">
                      {activeFile ? activeFile.name : "Belum ada file dipilih"}
                    </div>
                    <div className="text-gray-600 fs-7">
                      {activeFile
                        ? `Ukuran file: ${formatFileSize(activeFile.size)}`
                        : activeOption.helper}
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <span className="badge badge-light-primary">.xlsx</span>
                      <span className="badge badge-light-primary">.xls</span>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <label className="btn btn-sm btn-light-primary mb-0">
                    Pilih File
                    <input
                      type="file"
                      className="d-none"
                      accept=".xlsx,.xls"
                      disabled={activeLoading}
                      onChange={handleFileChange}
                    />
                  </label>

                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    disabled={!activeFile || activeLoading}
                    onClick={() => void handleUpload()}
                  >
                    {activeLoading ? "Uploading..." : "Upload File"}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded border border-gray-300 border-dashed bg-light px-5 py-4">
              <div className="fw-bold text-gray-900 fs-6 mb-1">
                {activeOption.title}
              </div>
              <div className="text-gray-600 fs-7 mb-3">
                {activeOption.description}
              </div>
              <div className="text-gray-500 fs-8">
                Endpoint:{" "}
                <span className="fw-semibold text-gray-700">
                  {activeOption.endpoint}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm h-100">
          <div className="card-header border-0 pt-6">
            <div className="card-title flex-column align-items-start">
              <h3 className="fw-bold text-gray-900 mb-1">Hasil Import</h3>
              <div className="text-gray-600 fs-7">
                Ringkasan hasil untuk kategori aktif.
              </div>
            </div>
          </div>

          <div className="card-body pt-2">
            {activeResult ? (
              <>
                <div className="rounded border border-gray-300 border-dashed px-5 py-4 mb-5">
                  <div className="fw-bold text-gray-900 fs-6 mb-1">
                    {activeResult.fileName}
                  </div>
                  <div className="text-gray-600 fs-7">
                    Total row: {formatNumber(activeResult.totalRows)} · Valid:{" "}
                    {formatNumber(activeResult.validRows)}
                  </div>
                </div>

                <div className="row g-4">
                  <div className="col-6">
                    <div className="rounded bg-light-success px-4 py-4">
                      <div className="text-gray-600 fs-8">Created</div>
                      <div className="fw-bold text-success fs-2">
                        {formatNumber(activeResult.created)}
                      </div>
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="rounded bg-light-primary px-4 py-4">
                      <div className="text-gray-600 fs-8">Updated</div>
                      <div className="fw-bold text-primary fs-2">
                        {formatNumber(activeResult.updated)}
                      </div>
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="rounded bg-light-warning px-4 py-4">
                      <div className="text-gray-600 fs-8">Skipped</div>
                      <div className="fw-bold text-warning fs-2">
                        {formatNumber(activeResult.skipped)}
                      </div>
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="rounded bg-light-info px-4 py-4">
                      <div className="text-gray-600 fs-8">Valid Rows</div>
                      <div className="fw-bold text-info fs-2">
                        {formatNumber(activeResult.validRows)}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="d-flex flex-column align-items-center justify-content-center py-10 text-center">
                <div className="fw-bold text-gray-900 fs-5 mb-1">
                  Belum ada hasil import
                </div>
                <div className="text-gray-600 fs-7">
                  Pilih file referensi, lalu upload untuk melihat ringkasan.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-6">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">
            <div>
              <div className="fw-bold text-gray-900 fs-5 mb-1">
                Alur kerja setelah import referensi
              </div>
              <div className="text-gray-600 fs-7">
                Setelah semua referensi resmi diupload, kembali ke Import Data
                Pegawai lalu jalankan validasi ulang batch.
              </div>
            </div>

            <a href="/integrasi/import" className="btn btn-sm btn-light-primary">
              Buka Import Data Pegawai
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}