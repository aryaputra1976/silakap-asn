import { PrismaService } from "@/prisma/prisma.service"

export async function getAgingWorkforce(
  prisma: PrismaService
) {

  const rows = await prisma.$queryRaw<any[]>`
    SELECT
      CASE
        WHEN TIMESTAMPDIFF(YEAR,tanggal_lahir,CURDATE()) < 30 THEN '20-30'
        WHEN TIMESTAMPDIFF(YEAR,tanggal_lahir,CURDATE()) < 40 THEN '31-40'
        WHEN TIMESTAMPDIFF(YEAR,tanggal_lahir,CURDATE()) < 50 THEN '41-50'
        WHEN TIMESTAMPDIFF(YEAR,tanggal_lahir,CURDATE()) < 60 THEN '51-60'
        ELSE '60+'
      END AS range_usia,
      COUNT(*) AS jumlah
    FROM silakap_pegawai
    WHERE deleted_at IS NULL
      AND status_aktif = 1
    GROUP BY range_usia
  `

  return rows
}