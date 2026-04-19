import { PrismaService } from "@/prisma/prisma.service"

export async function getIdealWorkforceByJabatan(
  prisma: PrismaService
) {

  const rows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT
      j.nama as jabatan,
      COUNT(p.id) as current
    FROM ref_jabatan j
    LEFT JOIN silakap_pegawai p
      ON p.jabatan_id = j.id
      AND p.deleted_at IS NULL
    GROUP BY j.nama
  `)

  return rows
}