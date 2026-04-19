import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'

const prisma = new PrismaClient()
const FILE = './data/import/tabel-ref.xlsx'

async function main() {
  console.log('📥 Import RefKedudukanHukum...')

  const workbook = XLSX.readFile(FILE)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows: any[] = XLSX.utils.sheet_to_json(sheet)

  const uniqueMap = new Map<string, string>()

  for (const row of rows) {
    const idSiasn = row['KEDUDUKAN HUKUM ID']
    const nama = row['KEDUDUKAN HUKUM NAMA']

    if (idSiasn && nama) {
      uniqueMap.set(String(idSiasn).trim(), String(nama).trim())
    }
  }

  console.log(`📊 Total unik: ${uniqueMap.size}`)

  let counter = 1

  await prisma.$transaction(async (tx) => {
    for (const [idSiasn, nama] of uniqueMap.entries()) {
      const kode = `KH-${String(counter).padStart(3, '0')}`

      await tx.refKedudukanHukum.upsert({
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

  console.log('✅ RefKedudukanHukum berhasil diimport')
}

main()
  .catch(e => {
    console.error('❌ ERROR:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
