import { z } from 'zod'

/**
 * BIGINT STRING VALIDATOR
 */
const bigintString = z
  .string()
  .regex(/^\d+$/, 'Harus berupa angka')

/**
 * SERVICE CODE ENUM
 */
export const serviceCodeSchema = z.enum([
  'PENSIUN',
  'MUTASI',
  'KGB',
  'JABATAN',
  'HUKDIS',
  'TUGAS_BELAJAR',
  'DATA_UPDATE'
])

/**
 * STATUS ENUM
 */
export const layananStatusSchema = z.enum([
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'REJECTED'
])

/**
 * CREATE USUL
 */
export const createUsulSchema = z.object({
  pegawaiId: bigintString,
  jenisLayananId: bigintString,
  jenisKode: serviceCodeSchema,
  payload: z.record(z.string(), z.any()).optional()
})

/**
 * SUBMIT USUL
 */
export const submitUsulSchema = z.object({
  usulId: bigintString
})

/**
 * WORKFLOW ACTION
 */
export const workflowActionSchema = z.object({
  usulId: bigintString,
  actionCode: z.string().min(1),
  actorRoleId: bigintString.optional()
})

/**
 * QUERY FILTER
 */
export const queryUsulSchema = z.object({
  pegawaiId: bigintString.optional(),
  jenisLayananId: bigintString.optional(),
  status: layananStatusSchema.optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional()
})

/**
 * SAFE BIGINT CONVERTER
 */
export const toBigInt = (v?: string) => {

  if (!v) return undefined

  try {
    return BigInt(v)
  } catch {
    throw new Error('Invalid bigint value')
  }

}