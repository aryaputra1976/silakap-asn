import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'

const prisma = new PrismaClient()
const FILE = './data/import/tabel-ref.xlsx'

async function main() {
  console.log('📥 Import RefPendidikanTingkat...')

  const workbook = XLSX.readFile(FILE)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows: any[] = XLSX.utils.sheet_to_json(sheet)

  const uniqueMap = new Map<string, string>()

  for (const row of rows) {
    const idSiasn = row['TINGKAT PENDIDIKAN ID']
    const nama = row['TINGKAT PENDIDIKAN NAMA']

    if (idSiasn && nama) {
      uniqueMap.set(String(idSiasn).trim(), String(nama).trim())
    }
  }

  console.log(`📊 Total tingkat pendidikan unik: ${uniqueMap.size}`)

  await prisma.$transaction(async (tx) => {
    for (const [idSiasn, nama] of uniqueMap.entries()) {
      await tx.refPendidikanTingkat.upsert({
        where: { idSiasn },
        update: { nama },
        create: {
          idSiasn,
          kode: idSiasn,   // konsisten: kode = id_siasn
          nama
        }
      })
    }
  })

  console.log('✅ RefPendidikanTingkat berhasil diimport')
}

main()
  .catch(e => {
    console.error('❌ ERROR:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
