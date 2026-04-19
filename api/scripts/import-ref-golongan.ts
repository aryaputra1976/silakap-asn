import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'

const prisma = new PrismaClient()
const FILE = './data/import/tabel-ref.xlsx'

async function main() {
  console.log('📥 Import RefGolongan (Final Clean)...')

  const workbook = XLSX.readFile(FILE)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows: any[] = XLSX.utils.sheet_to_json(sheet)

  const uniqueMap = new Map<string, string>()

  for (const row of rows) {
    const awalId = row['GOL AWAL ID']
    const awalNama = row['GOL AWAL NAMA']

    const akhirId = row['GOL AKHIR ID']
    const akhirNama = row['GOL AKHIR NAMA']

    if (awalId && awalNama) {
      uniqueMap.set(String(awalId).trim(), String(awalNama).trim())
    }

    if (akhirId && akhirNama) {
      uniqueMap.set(String(akhirId).trim(), String(akhirNama).trim())
    }
  }

  console.log(`📊 Total golongan unik: ${uniqueMap.size}`)

  await prisma.$transaction(async (tx) => {
    for (const [idSiasn, nama] of uniqueMap.entries()) {
      await tx.refGolongan.upsert({
        where: { idSiasn },
        update: { nama },
        create: {
          idSiasn,
          kode: idSiasn,  // ← sekarang kode = id_siasn
          nama
        }
      })
    }
  })

  console.log('✅ RefGolongan berhasil diimport')
}

main()
  .catch(e => {
    console.error('❌ ERROR:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
