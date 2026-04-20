import { z } from "zod"

export const createDmsBatchSchema = z.object({
  namaFile: z
    .string()
    .trim()
    .min(1, "Nama file wajib diisi")
    .max(255, "Nama file maksimal 255 karakter"),
  unorId: z.string().trim().optional().or(z.literal("")),
  periodeLabel: z
    .string()
    .trim()
    .max(100, "Periode maksimal 100 karakter")
    .optional()
    .or(z.literal("")),
  catatan: z
    .string()
    .trim()
    .max(5000, "Catatan maksimal 5000 karakter")
    .optional()
    .or(z.literal("")),
})

export type CreateDmsBatchSchema = z.infer<
  typeof createDmsBatchSchema
>