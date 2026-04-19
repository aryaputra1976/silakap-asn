import { prisma } from '@/core/prisma/prisma.client'

export class DocumentsService {

  async upload(
    usulId: bigint,
    jenisId: bigint,
    nama: string,
    filePath: string
  ) {

    return prisma.silakapDokumenUsul.create({
      data: {
        usulId,
        jenisId,
        nama,
        filePath
      }
    })

  }

  async delete(id: bigint) {

    return prisma.silakapDokumenUsul.delete({
      where: { id }
    })

  }

}
