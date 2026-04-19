import axios from "axios"

export type HttpError = {
  status: number
  message: string
  raw?: unknown
}

type ErrorPayload = {
  message?: string | string[]
}

export function parseHttpError(error: unknown): HttpError {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return {
        status: 0,
        message: "Tidak dapat terhubung ke server.",
        raw: error,
      }
    }

    const status = error.response.status
    const data = error.response.data as ErrorPayload | undefined

    if (Array.isArray(data?.message)) {
      return { status, message: data.message[0], raw: data }
    }

    if (typeof data?.message === "string") {
      return { status, message: data.message, raw: data }
    }

    return {
      status,
      message: "Terjadi kesalahan pada server.",
      raw: data,
    }
  }

  if (error instanceof Error) {
    return {
      status: -1,
      message: error.message,
      raw: error,
    }
  }

  return {
    status: -1,
    message: "Terjadi kesalahan tidak dikenal.",
    raw: error,
  }
}
