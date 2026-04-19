import { PrismaService } from "@/prisma/prisma.service"

export async function getTalentPool(
  prisma: PrismaService
) {

  return prisma.silakapPegawai.findMany({
    where: {
      golonganRank: { lte: 3 }
    },
    orderBy: [
      { pendidikanRank: "asc" },
      { masaKerjaTotal: "desc" }
    ],
    take: 50
  })
}