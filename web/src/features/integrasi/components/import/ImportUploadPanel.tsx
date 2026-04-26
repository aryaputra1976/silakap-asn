import { useRef } from "react"

export function ImportUploadPanel({
  file,
  onChange,
  onUpload,
  loading,
}: {
  file: File | null
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onUpload: () => void
  loading: boolean
}) {
  const ref = useRef<HTMLInputElement>(null)

  return (
    <div className="border rounded-xl p-5 bg-white">
      <h2 className="font-semibold">Upload File</h2>

      <input
        ref={ref}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={onChange}
        className="hidden"
      />

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-slate-600">
          {file ? file.name : "Belum ada file"}
        </div>

        <div className="flex gap-2">
          <button onClick={() => ref.current?.click()}>
            Pilih File
          </button>

          <button disabled={!file || loading} onClick={onUpload}>
            {loading ? "Upload..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  )
}