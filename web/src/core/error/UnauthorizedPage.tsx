export function UnauthorizedPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600">403</h1>
        <p className="text-gray-600 mt-2">Anda tidak memiliki akses.</p>
      </div>
    </div>
  )
}