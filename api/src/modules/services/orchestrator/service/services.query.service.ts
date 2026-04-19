import { Prisma } from '@prisma/client'
import { prisma } from '@/core/prisma/prisma.client'
import { BusinessError } from '@/core/errors/business.error'

export class ServicesQueryService {

  async getById(usulId: bigint) {

    const result = await prisma.silakapUsulLayanan.findUnique({
      where: { id: usulId },
      include: {
        pegawai: {
          select: {
            id: true,
            nip: true,
            nama: true
          }
        },
        jenis: true,
        layananLog: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        dokumenUsul: true
      }
    })

    if (!result) {
      throw new BusinessError(
        'USUL_NOT_FOUND',
        'Usul layanan tidak ditemukan'
      )
    }

    return result

  }

  async listByPegawai(pegawaiId: bigint) {

    return prisma.silakapUsulLayanan.findMany({
      where: { pegawaiId },
      include: {
        jenis: true
      },
      orderBy: {
        id: 'desc'
      }
    })

  }

  async list(
    where: Prisma.SilakapUsulLayananWhereInput,
    page = 1,
    limit = 20
  ) {

    const skip = (page - 1) * limit

    const [data, total] = await prisma.$transaction([
      prisma.silakapUsulLayanan.findMany({
        where,
        include: {
          pegawai: {
            select: {
              id: true,
              nip: true,
              nama: true
            }
          },
          jenis: true
        },
        orderBy: {
          id: 'desc'
        },
        skip,
        take: limit
      }),

      prisma.silakapUsulLayanan.count({ where })
    ])

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }

  }

}