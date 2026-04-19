import { PrismaService } from "@/prisma/prisma.service"

export async function getAsnJabatanStats(
  prisma: PrismaService,
  where: any
) {

  const result = await prisma.silakapPegawai.groupBy({
    by: ["jenisJabatanId"],
    where,
    _count: { _all: true }
  })

  const ids = result
    .map(r => r.jenisJabatanId)
    .filter((id): id is bigint => id !== null)

  const jabatan = await prisma.refJenisJabatan.findMany({
    where: {
      id: { in: ids }
    },
    select: {
      id: true,
      nama: true
    }
  })

  const map = new Map(
    jabatan.map(j => [j.id.toString(), j.nama])
  )

  return result.map(r => ({
    jabatan: r.jenisJabatanId
      ? map.get(r.jenisJabatanId.toString())
      : "Tidak Ada",
    jumlah: r._count._all
  }))

}