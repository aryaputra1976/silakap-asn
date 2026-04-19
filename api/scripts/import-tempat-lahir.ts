import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'

const prisma = new PrismaClient()

async function main() {
  console.log('📥 Membaca file Excel...')

  const workbook = XLSX.readFile('./data/import/11 . Data PNS 08 November 2025 Master.xlsx')
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows: any[] = XLSX.utils.sheet_to_json(sheet)

  // Ambil kombinasi unik
  const uniqueMap = new Map<string, string>()

  for (const row of rows) {
    const idSiasn = row['TEMPAT LAHIR ID']
    const nama = row['TEMPAT LAHIR NAMA']

    if (idSiasn && nama) {
      uniqueMap.set(String(idSiasn).trim(), String(nama).trim())
    }
  }

  console.log(`📊 Total unik: ${uniqueMap.size}`)

  let counter = 1

  await prisma.$transaction(async (tx) => {
    for (const [idSiasn, nama] of uniqueMap.entries()) {
      const kode = `TL-${String(counter).padStart(4, '0')}`

      await tx.refTempatLahir.upsert({
        where: { idSiasn },
        update: { nama },
        create: {
          idSiasn,
          nama,
          kode
        }
      })

      counter++
    }
  })

  console.log('✅ Import ref_tempat_lahir selesai')
}

main()
  .catch((e) => {
    console.error('❌ ERROR:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
