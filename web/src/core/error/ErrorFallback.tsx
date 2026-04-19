type Props = {
  error?: Error
}

export function ErrorFallback({ error }: Props) {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">
          Terjadi Kesalahan
        </h1>

        <p className="text-gray-600 mb-4">
          Aplikasi mengalami error tak terduga.
        </p>

        {error && (
          <pre className="text-xs text-gray-400 mb-4">
            {error.message}
          </pre>
        )}

        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Muat Ulang Halaman
        </button>
      </div>
    </div>
  )
}