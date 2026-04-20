import { PrismaService } from "@/prisma/prisma.service"
import { Prisma } from "@prisma/client"

export async function getAsnGolonganStats(
  prisma: PrismaService,
  where: any
) {
  const unorIds: bigint[] | undefined = where?.unorId?.in

  const unorFilter =
    unorIds && unorIds.length > 0
      ? Prisma.sql`AND p.unor_id IN (${Prisma.join(unorIds)})`
      : Prisma.empty

  const rows = await prisma.$queryRaw<any[]>`
    SELECT
      LEFT(g.kode,1) AS golongan,
      COUNT(*) AS jumlah
    FROM silakap_pegawai p
    JOIN ref_golongan g
      ON g.id = p.golongan_aktif_id
    WHERE p.deleted_at IS NULL
      AND p.status_aktif = 1
      ${unorFilter}
    GROUP BY golongan
  `

  const map: Record<string, number> = {
    I: 0,
    II: 0,
    III: 0,
    IV: 0
  }

  for (const r of rows) {

    if (r.golongan === '1') map.I = Number(r.jumlah)
    if (r.golongan === '2') map.II = Number(r.jumlah)
    if (r.golongan === '3') map.III = Number(r.jumlah)
    if (r.golongan === '4') map.IV = Number(r.jumlah)

  }

  return Object.entries(map).map(([golongan, jumlah]) => ({
    golongan,
    jumlah
  }))
}
