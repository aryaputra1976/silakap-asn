import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'

const prisma = new PrismaClient()
const FILE = './data/import/tabel-ref.xlsx'

async function main() {
  console.log('📥 Import RefStatusKepegawaian...')

  const workbook = XLSX.readFile(FILE)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows: any[] = XLSX.utils.sheet_to_json(sheet)

  const uniqueSet = new Set<string>()

  for (const row of rows) {
    const status = row['STATUS CPNS PNS']
    if (status) {
      uniqueSet.add(String(status).trim())
    }
  }

  console.log(`📊 Status unik ditemukan: ${[...uniqueSet].join(', ')}`)

  const mapping: Record<string, string> = {
    C: 'CPNS',
    P: 'PNS'
  }

  await prisma.$transaction(async (tx) => {
    for (const kode of uniqueSet) {
      const nama = mapping[kode] || kode

      await tx.refStatusKepegawaian.upsert({
        where: { idSiasn: kode },
        update: { nama },
        create: {
          idSiasn: kode,  // tidak ada ID SIASN lain
          kode,
          nama
        }
      })
    }
  })

  console.log('✅ RefStatusKepegawaian berhasil diimport')
}

main()
  .catch(e => {
    console.error('❌ ERROR:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
