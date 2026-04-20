import { z } from "zod"

export const importDmsBatchSchema = z.object({
  file: z
    .instanceof(File, {
      message: "File Excel wajib dipilih",
    })
    .refine(
      (file) =>
        /\.(xlsx|xls)$/i.test(file.name) ||
        [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        ].includes(file.type),
      "File harus berformat .xlsx atau .xls",
    ),
  batchId: z.string().trim().optional().or(z.literal("")),
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

export type ImportDmsBatchSchema = z.infer<
  typeof importDmsBatchSchema
>