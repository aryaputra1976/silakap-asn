import { PrismaService } from "@/prisma/prisma.service"

export async function getAbkRequirement(
  prisma: PrismaService
) {

  const rows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT
      jabatan_id,
      unor_id,
      SUM(volume_kerja * waktu_penyelesaian) as total_beban
    FROM silakap_abk
    GROUP BY jabatan_id, unor_id
  `)

  const WAKTU_EFEKTIF = 75000

  return rows.map(r => ({
    jabatanId: r.jabatan_id,
    unorId: r.unor_id,
    kebutuhan: Math.ceil(r.total_beban / WAKTU_EFEKTIF)
  }))
}