import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'

const prisma = new PrismaClient()

async function main() {
  console.log('📥 Membaca file unor2.xlsx...')

  const workbook = XLSX.readFile('./data/import/unor2.xlsx')
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows: any[] = XLSX.utils.sheet_to_json(sheet)

  console.log(`📊 Total baris: ${rows.length}`)

  // STEP 1: INSERT + SIMPAN URUTAN EXCEL
  await prisma.$transaction(async (tx) => {
    let orderCounter = 1

    for (const row of rows) {
      const idSiasn = String(row.ID).trim()
      const nama = String(row.NAMA_UNOR).trim()

      if (!idSiasn || !nama) continue

      await tx.refUnor.upsert({
        where: { idSiasn },
        update: {
          nama,
          sortOrder: orderCounter
        },
        create: {
          idSiasn,
          nama,
          kode: `TEMP-${idSiasn}`,
          sortOrder: orderCounter,
          isActive: true
        }
      })

      orderCounter++
    }
  })

  console.log('✅ Insert + sort_order selesai')

  // STEP 2: MAPPING PARENT
  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const idSiasn = String(row.ID).trim()
      const parentSiasn = row.ID_ATASAN
        ? String(row.ID_ATASAN).trim()
        : null

      if (!parentSiasn) continue

      const current = await tx.refUnor.findUnique({
        where: { idSiasn }
      })

      const parent = await tx.refUnor.findUnique({
        where: { idSiasn: parentSiasn }
      })

      if (!current || !parent) {
        console.warn(`⚠ Parent tidak ditemukan untuk ${idSiasn}`)
        continue
      }

      await tx.refUnor.update({
        where: { id: current.id },
        data: {
          parentId: parent.id
        }
      })
    }
  })

  console.log('✅ Parent mapping selesai')
  console.log('🎉 Import selesai dengan sukses')
}

main()
  .catch((e) => {
    console.error('❌ ERROR:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
