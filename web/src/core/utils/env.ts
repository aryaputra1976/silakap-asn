import { z } from "zod"

const envSchema = z.object({
  VITE_API_URL: z.string().min(1, "VITE_API_URL wajib diisi"),
  VITE_API_TIMEOUT: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      if (value === undefined || value === "") {
        return 20_000
      }

      const timeout =
        typeof value === "number" ? value : Number(value)

      if (!Number.isFinite(timeout) || timeout <= 0) {
        throw new Error(
          "VITE_API_TIMEOUT harus berupa angka positif",
        )
      }

      return timeout
    }),
  VITE_WS_URL: z.string().min(1).optional(),
})

const parsedEnv = envSchema.safeParse(import.meta.env)

if (!parsedEnv.success) {
  const message = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ")

  throw new Error(`Frontend environment tidak valid: ${message}`)
}

const rawEnv = parsedEnv.data

export const env = {
  apiUrl: rawEnv.VITE_API_URL.replace(/\/+$/, ""),
  apiTimeout: rawEnv.VITE_API_TIMEOUT,
  wsUrl:
    rawEnv.VITE_WS_URL?.replace(/\/+$/, "") ??
    rawEnv.VITE_API_URL.replace(/\/+$/, ""),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const

export type AppEnv = typeof env
