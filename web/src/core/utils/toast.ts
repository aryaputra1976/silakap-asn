import { toast } from 'react-hot-toast'

function normalizeMessage(input: unknown, fallback: string) {
  if (!input) return fallback

  if (typeof input === 'string') return input
  if (typeof input === 'number') return String(input)

  // Axios error response
  const anyInput = input as any

  if (anyInput?.response?.data?.message)
    return anyInput.response.data.message

  if (anyInput?.message)
    return anyInput.message

  try {
    return JSON.stringify(input)
  } catch {
    return fallback
  }
}

export const Toast = {
  success: (msg: unknown) =>
    toast.success(normalizeMessage(msg, 'Berhasil')),

  error: (msg: unknown) =>
    toast.error(normalizeMessage(msg, 'Terjadi kesalahan')),

  info: (msg: unknown) =>
    toast(normalizeMessage(msg, 'Informasi')),

  loading: (msg: unknown) =>
    toast.loading(normalizeMessage(msg, 'Memproses...')),

  dismiss: () => toast.dismiss(),
}