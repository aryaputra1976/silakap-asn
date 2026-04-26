import { useRef } from "react"

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
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-950">
          Upload File Import
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Upload file Excel atau CSV untuk membuat batch staging pegawai.
        </p>
      </div>

        <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={onChange}
            className="hidden"
            style={{ display: "none" }}
        />

      <div className="p-5">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                .xlsx / .xls / .csv
              </div>

              <p className="mt-3 truncate text-sm font-semibold text-slate-950">
                {file ? file.name : "Belum ada file dipilih"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {file
                  ? `Ukuran file: ${formatFileSize(file)}`
                  : "Pilih file sumber data pegawai sebelum upload."}
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={disabled || loading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Pilih File
              </button>

              <button
                type="button"
                disabled={!file || disabled || loading}
                onClick={onUpload}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Mengupload..." : "Upload File"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}