import { PrismaService } from "@/prisma/prisma.service"

export async function getRetirementByOpd(
  prisma: PrismaService
) {

  return prisma.$queryRawUnsafe(`
    SELECT
      u.nama as opd,
      COUNT(p.id) as total
    FROM silakap_pegawai p
    JOIN ref_unor u ON u.id = p.unor_id
    WHERE TIMESTAMPDIFF(YEAR, p.tanggal_lahir, CURDATE()) >= 57
    GROUP BY u.nama
    ORDER BY total DESC
  `)

}