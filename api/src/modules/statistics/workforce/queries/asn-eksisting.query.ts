import { PrismaService } from "@/prisma/prisma.service"

export class AsnEksistingQuery {

  constructor(private prisma: PrismaService) {}

  async countAllByUnor() {

    const result = await this.prisma.silakapPegawai.groupBy({

      by: ["unorId"],

      where: {

        statusAktif: true,

        statusAsn: {
          in: ["PNS", "PPPK"]
        }

      },

      _count: {
        id: true
      }

    })

    return result.map(r => ({
      unorId: r.unorId,
      asnEksisting: r._count.id
    }))

  }

}