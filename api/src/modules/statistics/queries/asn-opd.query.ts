import { PrismaService } from "@/prisma/prisma.service"
import { Prisma } from "@prisma/client"

export async function getAsnOpdStats(
  prisma: PrismaService,
  where: any
) {
  const unorIds: bigint[] | undefined = where?.unorId?.in

  const unorFilter =
    unorIds && unorIds.length > 0
      ? Prisma.sql`AND p.unor_id IN (${Prisma.join(unorIds)})`
      : Prisma.empty

  const result = await prisma.$queryRaw<any[]>`

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
    ${unorFilter}

GROUP BY opd.id, opd.nama

ORDER BY total DESC

`

  return result
}
