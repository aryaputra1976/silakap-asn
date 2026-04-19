import toast from 'react-hot-toast'

export function showApiError(message: string) {
  toast.error(message || 'Terjadi kesalahan pada server')
}