import { PrismaService } from "@/prisma/prisma.service"

export async function getGenderStats(
  prisma: PrismaService,
  where: any
) {

  const rows = await prisma.silakapPegawai.groupBy({
    by: ["jenisKelaminId"],
    where,
    _count: {
      jenisKelaminId: true
    }
  })

  if (!rows.length) return []

  const ids = rows
    .map(r => r.jenisKelaminId)
    .filter((id): id is bigint => id !== null)

  const refs = await prisma.refJenisKelamin.findMany({
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
    gender:
      map.get(r.jenisKelaminId?.toString() ?? "") ??
      "Tidak Diketahui",
    jumlah: r._count.jenisKelaminId
  }))
}