import { PrismaService } from "@/prisma/prisma.service"

export class WorkloadQuery {

  constructor(private prisma: PrismaService) {}

  async getByUnor(unorId: number, tahun: number) {

    return this.prisma.abkBebanKerja.findMany({
      where: {
        unorId,
        tahun
      },
      include: {
        tugas: true
      }
    })

  }

  async getAll(tahun: number) {

    return this.prisma.abkBebanKerja.findMany({
      where: { tahun },
      include: {
        tugas: true
      }
    })

  }

}