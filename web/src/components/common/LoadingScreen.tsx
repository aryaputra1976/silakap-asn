export function LoadingScreen() {
  return (
    <div className="d-flex flex-column flex-center flex-column-fluid">
      <div className="d-flex flex-column flex-center text-center p-10">
        <div className="spinner-border text-primary mb-5" role="status" />
        <h3 className="text-gray-800 fw-semibold">Memuat aplikasi...</h3>
        <div className="text-gray-500 fs-6">Mohon tunggu sebentar</div>
      </div>
    </div>
  )
}