import { prisma } from '@/core/prisma/prisma.client'

export class DocumentsQueryService {

  async listByUsul(usulId: bigint) {

    return prisma.silakapDokumenUsul.findMany({
      where: {
        usulId
      },
      orderBy: {
        id: 'desc'
      }
    })

  }

  async detail(id: bigint) {

    return prisma.silakapDokumenUsul.findUnique({
      where: {
        id
      }
    })

  }

}
