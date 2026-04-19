import { PrismaService } from "@/prisma/prisma.service"

export async function getWorkforceGap(
  prisma: PrismaService
) {

  const rows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT
      u.id AS unor_id,
      u.nama AS opd,
      COALESCE(u.formasi_ideal,0) AS ideal_asn,
      COUNT(p.id) AS current_asn,
      COALESCE(u.formasi_ideal,0) - COUNT(p.id) AS gap
    FROM ref_unor u
    LEFT JOIN silakap_pegawai p
      ON p.unor_id = u.id
      AND p.deleted_at IS NULL
      AND p.status_aktif = 1
    WHERE u.deleted_at IS NULL
      AND u.level = 2
    GROUP BY u.id, u.nama, u.formasi_ideal
    ORDER BY gap DESC
  `)

  return rows.map(r => {

    const current = Number(r.current_asn)
    const ideal = Number(r.ideal_asn)
    const gap = ideal - current

    return {
      unorId: Number(r.unor_id),
      opd: r.opd,
      current,
      ideal,
      gap,
      status:
        gap > 0 ? "KEKURANGAN"
        : gap < 0 ? "KELEBIHAN"
        : "IDEAL"
    }

  })
}