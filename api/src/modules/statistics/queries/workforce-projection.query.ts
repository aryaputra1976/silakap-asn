import { PrismaService } from "@/prisma/prisma.service"

export async function getWorkforceProjection(
  prisma: PrismaService
) {

  const rows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT
      YEAR(DATE_ADD(tanggal_lahir, INTERVAL 60 YEAR)) as tahun_pensiun,
      COUNT(*) as total
    FROM silakap_pegawai
    WHERE deleted_at IS NULL
    GROUP BY tahun_pensiun
    ORDER BY tahun_pensiun
  `)

  return rows
}