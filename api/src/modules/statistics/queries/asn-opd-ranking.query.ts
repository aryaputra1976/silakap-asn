import { PrismaService } from "@/prisma/prisma.service"

export async function getAsnOpdRanking(
  prisma: PrismaService,
  where: any
) {

  const grouped = await prisma.silakapPegawai.groupBy({
    by: ["unorId"],
    where,
    _count: { _all: true },
    orderBy: {
      _count: {
        unorId: "desc"
      }
    },
    take: 10
  })

  const unorIds: bigint[] = grouped
    .map(g => g.unorId)
    .filter((id): id is bigint => id !== null)

  const unors = await prisma.refUnor.findMany({
    where: {
      id: { in: unorIds }
    },
    select: {
      id: true,
      nama: true
    }
  })

  const map = new Map(
    unors.map(u => [u.id.toString(), u.nama])
  )

  return grouped.map(g => ({
    unorId: g.unorId,
    namaUnor: g.unorId
      ? map.get(g.unorId.toString()) ?? "-"
      : "-",
    total: g._count?._all ?? 0
  }))
}