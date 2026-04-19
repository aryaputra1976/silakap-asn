import { PrismaService } from "@/prisma/prisma.service"

export async function getAsnOpdStats(
  prisma: PrismaService,
  where: any
) {

  const result = await prisma.$queryRawUnsafe<any[]>(`

SELECT
    opd.id AS "unorId",
    opd.nama AS "namaUnor",

    COUNT(p.id) AS total,

    SUM(CASE WHEN p.status_asn = 'PNS' THEN 1 ELSE 0 END) AS pns,
    SUM(CASE WHEN p.status_asn = 'PPPK' THEN 1 ELSE 0 END) AS pppk,
    SUM(CASE WHEN p.status_asn = 'PPPK_PARUH_WAKTU' THEN 1 ELSE 0 END) AS "pppkParuhWaktu"

FROM silakap_pegawai p

LEFT JOIN ref_unor u
    ON u.id = p.unor_id

LEFT JOIN ref_unor parent
    ON parent.id = u.parent_id

JOIN ref_unor opd
    ON opd.id = CASE
        WHEN u.level = 2 THEN u.id
        WHEN parent.level = 2 THEN parent.id
    END

WHERE
    p.deleted_at IS NULL
    AND p.status_aktif = true

GROUP BY opd.id, opd.nama

ORDER BY total DESC

`)

  return result
}