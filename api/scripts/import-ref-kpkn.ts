import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'

const prisma = new PrismaClient()
const FILE = './data/import/tabel-ref.xlsx'

async function main() {
  console.log('📥 Import RefKpkn...')

  const workbook = XLSX.readFile(FILE)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows: any[] = XLSX.utils.sheet_to_json(sheet)

  const seen = new Set<string>()
  const dataList: {
    idSiasn: string
    nama: string
  }[] = []

  for (const row of rows) {
    const idSiasn = row['KPKN ID']
    const nama = row['KPKN NAMA']

    if (idSiasn && nama) {
      const cleanId = String(idSiasn).trim()

      if (!seen.has(cleanId)) {
        seen.add(cleanId)
        dataList.push({
          idSiasn: cleanId,
          nama: String(nama).trim()
        })
      }
    }
  }

  console.log(`📊 Total KPKN unik: ${dataList.length}`)

  await prisma.$transaction(async (tx) => {

    let counter = 1

    for (const item of dataList) {

      const kode = `KPKN-${String(counter).padStart(3, '0')}`

      await tx.refKpkn.upsert({
        where: { idSiasn: item.idSiasn },
        update: {
          nama: item.nama
        },
        create: {
          idSiasn: item.idSiasn,
          kode,
          nama: item.nama
        }
      })

      counter++
    }
  })

  console.log('✅ RefKpkn berhasil diimport')
}

main()
  .catch(e => {
    console.error('❌ ERROR:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
