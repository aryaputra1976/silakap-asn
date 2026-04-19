import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'

const prisma = new PrismaClient()
const FILE = './data/import/tabel-ref.xlsx'

async function main() {
  console.log('📥 Import RefAgama dari Excel...')

  const workbook = XLSX.readFile(FILE)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows: any[] = XLSX.utils.sheet_to_json(sheet)

  // Ambil unik
  const uniqueMap = new Map<string, string>()

  for (const row of rows) {
    const idSiasn = row['AGAMA ID']
    const nama = row['AGAMA NAMA']

    if (idSiasn && nama) {
      uniqueMap.set(String(idSiasn).trim(), String(nama).trim())
    }
  }

  console.log(`📊 Total agama unik: ${uniqueMap.size}`)

  let counter = 1

  await prisma.$transaction(async (tx) => {
    for (const [idSiasn, nama] of uniqueMap.entries()) {
      const kode = String(counter).padStart(2, '0') // contoh: 01, 02

      await tx.refAgama.upsert({
        where: { idSiasn },
        update: { nama },
        create: {
          idSiasn,
          kode,
          nama
        }
      })

      counter++
    }
  })

  console.log('✅ RefAgama selesai diimport')
}

main()
  .catch(e => {
    console.error('❌ ERROR:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
