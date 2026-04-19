import { PrismaService } from "@/prisma/prisma.service"

export async function getAsnUsiaStats(
  prisma: PrismaService,
  where: any
) {

  const data = await prisma.silakapPegawai.findMany({
    where,
    select: {
      tanggalLahir: true
    }
  })

  const now = new Date()

  const ranges: Record<string, number> = {
    "20-30": 0,
    "31-40": 0,
    "41-50": 0,
    "51-60": 0,
    "60+": 0
  }

  for (const d of data) {

    if (!d.tanggalLahir) continue

    const age =
      now.getFullYear() -
      d.tanggalLahir.getFullYear()

    if (age <= 30) ranges["20-30"]++
    else if (age <= 40) ranges["31-40"]++
    else if (age <= 50) ranges["41-50"]++
    else if (age <= 60) ranges["51-60"]++
    else ranges["60+"]++
  }

  return Object.entries(ranges).map(([range, jumlah]) => ({
    range,
    jumlah
  }))
}