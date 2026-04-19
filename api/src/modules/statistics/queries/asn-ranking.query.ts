import { PrismaService } from "@/prisma/prisma.service"

export async function getAsnRanking(
  prisma: PrismaService,
  where: any
) {

  return prisma.silakapPegawai.findMany({
    where,
    orderBy: [
      { jenisJabatanRank: "asc" },
      { golonganRank: "asc" },
      { masaKerjaTotal: "desc" },
      { pendidikanRank: "asc" },
    ],
    take: 10,
    select: {
      nip: true,
      nama: true,
      golonganRank: true,
      masaKerjaTotal: true,
      jenisJabatanRank: true,
    },
  })
}