import { KTIcon } from "@/_metronic/helpers"

export function ImportPageHeader() {
  return (
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
              Import Data Pegawai
            </div>
            <div className="text-white opacity-75 fs-6 lh-lg">
              Upload file Excel atau CSV ke staging, validasi data, lengkapi
              referensi yang hilang, lalu commit hanya data yang sudah valid.
            </div>

            <div className="d-flex flex-wrap gap-2 mt-4">
              <span className="badge badge-light-primary">Upload Excel</span>
              <span className="badge badge-light-warning">Validasi</span>
              <span className="badge badge-light-info">Perbaiki</span>
              <span className="badge badge-light-success">Commit</span>
            </div>
          </div>

          <div
            className="rounded-circle d-none d-lg-inline-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: 68,
              height: 68,
              background: "rgba(255,255,255,0.12)",
              color: "#ffffff",
            }}
          >
            <KTIcon iconName="file-up" className="fs-1" />
          </div>
        </div>
      </div>
    </div>
  )
}