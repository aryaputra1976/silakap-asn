import { formatNumber } from "./import-ui"

type MissingItem = {
  value: string
  name: string | null
  count: number
  sampleRows: number[]
}

type MissingData = {
  jabatan: MissingItem[]
  unor: MissingItem[]
  pendidikan: MissingItem[]
}

export function ImportMissingReferencesPanel({
  data,
  loading,
  disabled,
  jabatanLoading,
  unorLoading,
  pendidikanLoading,
  onCreateJabatan,
  onCreateUnor,
  onCreatePendidikan,
}: {
  data?: MissingData
  loading: boolean
  disabled: boolean
  jabatanLoading: boolean
  unorLoading: boolean
  pendidikanLoading: boolean
  onCreateJabatan: () => void
  onCreateUnor: () => void
  onCreatePendidikan: () => void
}) {
  const groups = [
    {
      key: "jabatan",
      title: "Jabatan",
      items: data?.jabatan ?? [],
      loading: jabatanLoading,
      action: onCreateJabatan,
    },
    {
      key: "unor",
      title: "UNOR",
      items: data?.unor ?? [],
      loading: unorLoading,
      action: onCreateUnor,
    },
    {
      key: "pendidikan",
      title: "Pendidikan",
      items: data?.pendidikan ?? [],
      loading: pendidikanLoading,
      action: onCreatePendidikan,
    },
  ]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Missing References
      </h2>

      <div className="mt-4 space-y-4">
        {groups.map((group) => (
          <div
            key={group.key}
            className="rounded-xl border border-slate-200 p-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{group.title}</div>
                <div className="text-xs text-slate-500">
                  {formatNumber(group.items.length)} data
                </div>
              </div>

              <button
                disabled={disabled || group.items.length === 0}
                onClick={group.action}
                className="rounded-xl bg-slate-900 px-3 py-2 text-xs text-white disabled:opacity-40"
              >
                {group.loading ? "Proses..." : "Generate"}
              </button>
            </div>

            <div className="mt-3 max-h-40 overflow-auto space-y-2">
              {loading ? (
                <div className="text-sm text-slate-500">
                  Memuat...
                </div>
              ) : group.items.length === 0 ? (
                <div className="text-sm text-slate-500">
                  Tidak ada data
                </div>
              ) : (
                group.items.slice(0, 20).map((item) => (
                  <div
                    key={item.value}
                    className="rounded-lg bg-slate-50 p-2 text-xs"
                  >
                    <div className="font-semibold">
                      {item.name ?? "(tanpa nama)"}
                    </div>
                    <div className="text-slate-500">
                      {item.count} baris
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}