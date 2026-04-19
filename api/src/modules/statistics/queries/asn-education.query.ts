import { PrismaService } from "@/prisma/prisma.service"

export async function getEducationStats(
  prisma: PrismaService,
  where: any
) {

  const rows = await prisma.silakapPegawai.groupBy({
    by: ["pendidikanTingkatId"],
    where,
    _count: {
      pendidikanTingkatId: true
    }
  })

  const ids = rows
    .map(r => r.pendidikanTingkatId)
    .filter((id): id is bigint => id !== null)

  const refs = await prisma.refPendidikanTingkat.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      nama: true
    }
  })

  const map = new Map(
    refs.map(r => [r.id.toString(), r.nama])
  )

  return rows.map(r => ({
    pendidikan:
      map.get(r.pendidikanTingkatId?.toString() ?? "") ??
      "Tidak Diketahui",
    jumlah: r._count.pendidikanTingkatId
  }))
}