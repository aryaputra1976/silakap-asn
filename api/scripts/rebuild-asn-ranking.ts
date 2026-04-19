import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {

  const pegawai = await prisma.silakapPegawai.findMany({
    select: {
      id: true,
      mkTahun: true,
      mkBulan: true,
      jenisJabatanId: true,
      golonganAktifId: true,
      pendidikanTingkatId: true
    }
  })

  for (const p of pegawai) {

    const masaKerja =
      (p.mkTahun ?? 0) * 12 +
      (p.mkBulan ?? 0)

    await prisma.silakapPegawai.update({
      where: { id: p.id },
      data: {
        masaKerjaTotal: masaKerja
      }
    })

  }

  console.log("Ranking ASN berhasil dihitung")
}

main()