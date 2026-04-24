interface Props {
  message: string
}

export function WorkflowError({ message }: Props) {
  if (!message) return null

  return (
    <div className="alert alert-danger d-flex flex-column gap-2 py-4 mb-6">
      <div className="fw-bold text-danger">Gagal memuat antrian verifikasi</div>
      <div>{message}</div>
      <div className="fs-7 text-danger">
        Muat ulang halaman setelah backend queue aktif atau periksa koneksi login Anda.
      </div>
    </div>
  )
}
