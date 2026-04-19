import { z } from 'zod'

export const uploadDocumentSchema = z.object({

  usulId: z.string(),
  nama: z.string(),
  filePath: z.string()

})

export const deleteDocumentSchema = z.object({

  id: z.string()

})
