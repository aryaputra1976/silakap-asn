import { PrismaService } from "@/prisma/prisma.service"

export async function getRetirementPrediction(
  prisma: PrismaService,
  where: any
) {

  const rows = await prisma.$queryRaw<any[]>`
    SELECT
      YEAR(tanggal_lahir) AS tahun_lahir,
      COUNT(*) AS jumlah
    FROM silakap_pegawai
    WHERE status_asn = 'PNS'
      AND deleted_at IS NULL
    GROUP BY tahun_lahir
  `

  const currentYear = new Date().getFullYear()

  const result: Record<string, number> = {
    "1 Tahun": 0,
    "2 Tahun": 0,
    "3 Tahun": 0,
    "4 Tahun": 0,
    "5 Tahun": 0
  }

  for (const r of rows) {

    const tahunLahir = Number(r.tahun_lahir)
    const jumlah = Number(r.jumlah)

    const age = currentYear - tahunLahir
    const yearsLeft = 58 - age

    if (yearsLeft >= 0 && yearsLeft <= 5) {

      const key = `${yearsLeft + 1} Tahun`

      if (result[key] !== undefined) {
        result[key] += jumlah
      }

    }

  }  

  return Object.entries(result).map(([tahun, jumlah]) => ({
    tahun,
    jumlah
  }))
}