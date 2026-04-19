import { PrismaService } from "@/prisma/prisma.service"

export class AbkHasilQuery {

  constructor(private prisma: PrismaService) {}

  async getByUnor(unorId: number, tahun: number) {

    return this.prisma.abkHasilPerhitungan.findMany({

      where: {
        unorId,
        tahun
      },

      select: {

        totalBeban: true,
        kebutuhanAsn: true

      }

    })

  }

  async getAll(tahun: number) {

    return this.prisma.abkHasilPerhitungan.findMany({

      where: { tahun },

      select: {

        unorId: true,
        totalBeban: true,
        kebutuhanAsn: true

      }

    })

  }

}