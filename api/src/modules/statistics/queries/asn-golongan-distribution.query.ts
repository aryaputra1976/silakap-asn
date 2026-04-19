import { PrismaService } from "@/prisma/prisma.service"

export async function getAsnGolonganStats(
  prisma: PrismaService,
  where: any
) {

  const result = await prisma.silakapPegawai.groupBy({
    by: ["golonganAktifId"],
    where,
    _count: {
      _all: true
    },
    orderBy: {
      golonganAktifId: "asc"
    }
  })

  return result.map(r => ({
    golonganAktifId: r.golonganAktifId,
    jumlah: r._count?._all ?? 0
  }))
}