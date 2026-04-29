import { useAsnPendidikan } from "../hooks/useAsnPendidikan"

interface Props {
  asnId: string
}

export function AsnPendidikanTab({ asnId }: Props) {
  const { data, loading } = useAsnPendidikan(asnId)

  if (loading) {
    return (
      <div className="card shadow-sm border-0">
        <div className="card-body d-flex align-items-center justify-content-center py-12">
          <div className="spinner-border text-primary me-3" role="status" />
          <span className="text-muted fw-semibold">Memuat riwayat pendidikan...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header border-0 pt-5 pb-3">
        <div className="card-title fw-bolder text-gray-900">
          Riwayat Pendidikan
          {data.length > 0 && (
            <span className="badge badge-light-primary fw-bold fs-8 ms-3">
              {data.length} entri
            </span>
          )}
        </div>
      </div>
      <div className="card-body pt-0">
        <div className="table-responsive">
          <table className="table align-middle table-row-dashed fs-6 gy-3 mb-0">
            <thead>
              <tr className="text-start text-muted fw-bolder fs-7 text-uppercase gs-0">
                <th className="min-w-100px">Jenjang</th>
                <th className="min-w-200px">Bidang Studi / Jurusan</th>
                <th className="min-w-200px">Nama Sekolah / Instansi</th>
                <th className="min-w-100px">Tahun Lulus</th>
              </tr>
            </thead>
            <tbody className="fw-semibold text-gray-700">
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-10">
                    Belum ada data riwayat pendidikan
                  </td>
                </tr>
              )}
              {data.map((row) => (
                <tr key={row.id}>
                  <td>
                    {row.jenjang ? (
                      <span className="badge badge-light-success fw-bold fs-8">
                        {row.jenjang}
                      </span>
                    ) : "-"}
                  </td>
                  <td className="fw-bold text-gray-900">{row.bidangStudi ?? "-"}</td>
                  <td className="text-muted">{row.namaSekolah ?? "-"}</td>
                  <td className="fw-semibold">{row.tahunLulus ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
