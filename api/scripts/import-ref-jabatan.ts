import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'

const prisma = new PrismaClient()

/* ================================
   INTERFACE TYPE EXCEL
================================ */

interface JabatanStrukturalRow {
  ID: string
  Nama_unor?: string
  Nama_jabatan: string
  Eselon_id?: string
}

interface JabatanFungsionalRow {
  ID: string
  Nama: string
  BUP?: number
  JENJANG?: string
}

interface JabatanPelaksanaRow {
  ID: string
  Nama: string
}

/* ================================
   MAIN
================================ */

async function main() {
  console.log('🚀 Import RefJabatan dimulai...')

  // =============================
  // Lookup Jenis Jabatan
  // =============================

  const jenisStruktural = await prisma.refJenisJabatan.findUnique({
    where: { idSiasn: '1' } // Struktural
  })

  const jenisFungsional = await prisma.refJenisJabatan.findUnique({
    where: { idSiasn: '2' } // Fungsional
  })

  const jenisPelaksana = await prisma.refJenisJabatan.findUnique({
    where: { idSiasn: '4' } // Pelaksana
  })

  if (!jenisStruktural || !jenisFungsional || !jenisPelaksana) {
    throw new Error('❌ RefJenisJabatan belum lengkap.')
  }

  // Gunakan transaction supaya atomic
  await prisma.$transaction(async (tx) => {

    /* =================================================
       1️⃣ STRUKTURAL
    ================================================= */

    console.log('📥 Import Jabatan Struktural...')

    const strukturalFile = XLSX.readFile('./data/import/jabatan-struktural.xlsx')
    const strukturalRows = XLSX.utils.sheet_to_json(
      strukturalFile.Sheets[strukturalFile.SheetNames[0]]
    ) as JabatanStrukturalRow[]

    for (const row of strukturalRows) {
      if (!row.ID || !row.Nama_jabatan) continue

      const idSiasn = String(row.ID).trim()

      await tx.refJabatan.upsert({
        where: { idSiasn },
        update: {
          nama: row.Nama_jabatan,
          eselonId: row.Eselon_id ?? null,
          unorNama: row.Nama_unor ?? null,
          jenisJabatanId: jenisStruktural.id
        },
        create: {
          idSiasn,
          kode: `STR-${idSiasn}`,
          nama: row.Nama_jabatan,
          jenisJabatanId: jenisStruktural.id,
          eselonId: row.Eselon_id ?? null,
          unorNama: row.Nama_unor ?? null
        }
      })
    }

    /* =================================================
       2️⃣ FUNGSIONAL
    ================================================= */

    console.log('📥 Import Jabatan Fungsional...')

    const fungsionalFile = XLSX.readFile('./data/import/jabatan-fungsional.xlsx')
    const fungsionalRows = XLSX.utils.sheet_to_json(
      fungsionalFile.Sheets[fungsionalFile.SheetNames[0]]
    ) as JabatanFungsionalRow[]

    for (const row of fungsionalRows) {
      if (!row.ID || !row.Nama) continue

      const idSiasn = String(row.ID).trim()

      await tx.refJabatan.upsert({
        where: { idSiasn },
        update: {
          nama: row.Nama,
          jenjang: row.JENJANG ?? null,
          bup: row.BUP ? Number(row.BUP) : null,
          jenisJabatanId: jenisFungsional.id
        },
        create: {
          idSiasn,
          kode: `FUNG-${idSiasn}`,
          nama: row.Nama,
          jenisJabatanId: jenisFungsional.id,
          jenjang: row.JENJANG ?? null,
          bup: row.BUP ? Number(row.BUP) : null
        }
      })
    }

    /* =================================================
       3️⃣ PELAKSANA
    ================================================= */

    console.log('📥 Import Jabatan Pelaksana...')

    const pelaksanaFile = XLSX.readFile('./data/import/jabatan-pelaksana.xlsx')
    const pelaksanaRows = XLSX.utils.sheet_to_json(
      pelaksanaFile.Sheets[pelaksanaFile.SheetNames[0]]
    ) as JabatanPelaksanaRow[]

    for (const row of pelaksanaRows) {
      if (!row.ID || !row.Nama) continue

      const idSiasn = String(row.ID).trim()

      await tx.refJabatan.upsert({
        where: { idSiasn },
        update: {
          nama: row.Nama,
          jenisJabatanId: jenisPelaksana.id
        },
        create: {
          idSiasn,
          kode: `PLK-${idSiasn}`,
          nama: row.Nama,
          jenisJabatanId: jenisPelaksana.id
        }
      })
    }

  })

  console.log('✅ Import RefJabatan selesai.')
}

/* ================================
   EXECUTE
================================ */

main()
  .catch((e) => {
    console.error('❌ ERROR:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
