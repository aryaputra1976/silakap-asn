import { PrismaService } from "@/prisma/prisma.service"

export class KebutuhanAsnQuery {

  constructor(private prisma: PrismaService) {}

  async getByUnor(unorId: number, tahun: number) {

    return this.prisma.abkBebanKerja.findMany({

      where: {
        unorId,
        tahun
      },

      select: {

        volumeKerja: true,
        tugasId: true,
        jabatanId: true

      }

    })

  }

  async getAll(tahun: number) {

    return this.prisma.abkBebanKerja.findMany({

      where: { tahun },

      select: {

        unorId: true,
        volumeKerja: true,
        tugasId: true,
        jabatanId: true

      }

    })

  }

}