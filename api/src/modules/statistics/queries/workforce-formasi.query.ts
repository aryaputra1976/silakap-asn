import { PrismaService } from "@/prisma/prisma.service"

export async function getFormasiRecommendation(
  prisma: PrismaService
) {

  const rows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT
      u.nama as opd,
      COUNT(p.id) as asn_aktif,
      SUM(CASE WHEN TIMESTAMPDIFF(YEAR, p.tanggal_lahir, CURDATE()) >= 58 THEN 1 ELSE 0 END) as pensiun
    FROM ref_unor u
    LEFT JOIN silakap_pegawai p
      ON p.unor_id = u.id
    GROUP BY u.nama
  `)

  return rows
}