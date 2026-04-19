import { PrismaService } from "@/prisma/prisma.service"
import { StatusAsn } from "@prisma/client"

export async function getAsnSummary(
  prisma: PrismaService,
  where: any
) {

  const total = await prisma.silakapPegawai.count({
    where
  })

  const pns = await prisma.silakapPegawai.count({
    where: {
      ...where,
      statusAsn: StatusAsn.PNS
    }
  })

  const pppk = await prisma.silakapPegawai.count({
    where: {
      ...where,
      statusAsn: StatusAsn.PPPK
    }
  })

  const pppkParuhWaktu = await prisma.silakapPegawai.count({
    where: {
      ...where,
      statusAsn: StatusAsn.PPPK_PARUH_WAKTU
    }
  })

  return {
    total,
    pns,
    pppk,
    pppkParuhWaktu
  }
}