import { useRef } from "react"

type ImportUploadPanelProps = {
  file: File | null
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onUpload: () => void
  loading: boolean
  disabled?: boolean
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-slate-950">
          Upload File Import
        </h2>
        <p className="text-sm text-slate-500">
          Format yang didukung: .xlsx, .xls, atau .csv.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={onChange}
        className="hidden"
      />

      <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {file ? file.name : "Belum ada file dipilih"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              File akan diupload sebagai batch import pegawai.
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              disabled={disabled || loading}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Pilih File
            </button>

            <button
              type="button"
              disabled={!file || disabled || loading}
              onClick={onUpload}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Mengupload..." : "Upload"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}