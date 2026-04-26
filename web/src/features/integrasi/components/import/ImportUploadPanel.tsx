import { useRef } from "react"
import { KTIcon } from "@/_metronic/helpers"

type ImportUploadPanelProps = {
  file: File | null
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onUpload: () => void
  loading: boolean
  disabled?: boolean
}

function formatFileSize(file: File): string {
  const sizeKb = Math.max(1, Math.round(file.size / 1024))
  return `${sizeKb.toLocaleString("id-ID")} KB`
}

export function ImportUploadPanel({
  file,
  onChange,
  onUpload,
  loading,
  disabled = false,
}: ImportUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="card shadow-sm h-100">
      <div className="card-header border-0 pt-6">
        <div className="card-title flex-column align-items-start">
          <h3 className="fw-bold text-gray-900 mb-1">Upload File Import</h3>
          <div className="text-gray-600 fs-7">
            Format yang didukung: .xlsx, .xls, atau .csv
          </div>
        </div>
      </div>

      <div className="card-body pt-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={onChange}
          style={{ display: "none" }}
        />

        <div className="rounded border border-gray-300 border-dashed bg-light-primary bg-opacity-10 px-5 py-5">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-5">
            <div className="d-flex align-items-start gap-4">
              <div className="symbol symbol-50px">
                <div className="symbol-label bg-light-primary">
                  <KTIcon iconName="file-up" className="fs-2 text-primary" />
                </div>
              </div>

              <div>
                <div className="fw-bold text-gray-900 fs-6">
                  {file ? file.name : "Belum ada file dipilih"}
                </div>
                <div className="text-gray-600 fs-7 mt-1">
                  {file
                    ? `Ukuran file: ${formatFileSize(file)}`
                    : "Pilih file sumber data pegawai sebelum upload."}
                </div>

                <div className="d-flex flex-wrap gap-2 mt-3">
                  <span className="badge badge-light-primary">.xlsx</span>
                  <span className="badge badge-light-primary">.xls</span>
                  <span className="badge badge-light-primary">.csv</span>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                disabled={disabled || loading}
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-sm btn-light-primary"
              >
                Pilih File
              </button>

              <button
                type="button"
                disabled={!file || disabled || loading}
                onClick={onUpload}
                className="btn btn-sm btn-primary"
              >
                {loading ? "Mengupload..." : "Upload File"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}