import { Prisma } from '@prisma/client'
import { BusinessError } from '@/core/errors/business.error'

export class ServicesDocumentService {

  async validateDocuments(
    tx: Prisma.TransactionClient,
    usulId: bigint
  ) {

    /**
     * Ambil jenis layanan dari usul
     */
    const usul = await tx.silakapUsulLayanan.findUnique({
      where: { id: usulId },
      select: {
        jenisLayananId: true
      }
    })

    if (!usul) {
      throw new BusinessError(
        'USUL_NOT_FOUND',
        'Usul layanan tidak ditemukan'
      )
    }

    /**
     * Ambil dokumen yang sudah di-upload
     */
    const docs = await tx.silakapDokumenUsul.findMany({
      where: { usulId },
      select: {
        jenisId: true
      }
    })

    /**
     * Ambil syarat dokumen wajib
     */
    const requiredDocs = await tx.silakapSyaratLayanan.findMany({
      where: {
        layananId: usul.jenisLayananId,
        wajib: true
      },
      select: {
        jenisId: true,
        jenis: {
          select: {
            nama: true
          }
        }
      }
    })

    /**
     * Set dokumen yang sudah diupload
     */
    const uploadedIds = new Set(
      docs.map(d => String(d.jenisId))
    )

    const missingDocs: string[] = []

    /**
     * Validasi dokumen wajib
     */
    for (const doc of requiredDocs) {

      const jenisId = String(doc.jenisId)

      if (!uploadedIds.has(jenisId)) {
        missingDocs.push(doc.jenis.nama)
      }

    }

    /**
     * Jika ada dokumen yang belum lengkap
     */
    if (missingDocs.length > 0) {

      throw new BusinessError(
        'DOCUMENTS_NOT_COMPLETE',
        `Dokumen wajib belum lengkap: ${missingDocs.join(', ')}`
      )

    }

    return true

  }

}