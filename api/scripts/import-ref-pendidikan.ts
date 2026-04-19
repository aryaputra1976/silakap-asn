import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'

const prisma = new PrismaClient()
const FILE = './data/import/tabel-ref.xlsx'

async function main() {
  console.log('📥 Import RefPendidikan (Revised)...')

  const workbook = XLSX.readFile(FILE)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows: any[] = XLSX.utils.sheet_to_json(sheet)

  // Ambil unik tapi preserve urutan Excel
  const seen = new Set<string>()
  const dataList: {
    idSiasn: string
    nama: string
    tingkatSiasnId: string
  }[] = []

  for (const row of rows) {
    const idSiasn = row['PENDIDIKAN ID']
    const nama = row['PENDIDIKAN NAMA']
    const tingkatId = row['TINGKAT PENDIDIKAN ID']

    if (idSiasn && nama && tingkatId) {
      const cleanId = String(idSiasn).trim()
      if (!seen.has(cleanId)) {
        seen.add(cleanId)
        dataList.push({
          idSiasn: cleanId,
          nama: String(nama).trim(),
          tingkatSiasnId: String(tingkatId).trim()
        })
      }
    }
  }

  console.log(`📊 Total pendidikan unik: ${dataList.length}`)

  await prisma.$transaction(async (tx) => {

    let counter = 1

    for (const item of dataList) {

      const tingkat = await tx.refPendidikanTingkat.findUnique({
        where: { idSiasn: item.tingkatSiasnId }
      })

      if (!tingkat) {
        console.warn(`⚠ Tingkat tidak ditemukan: ${item.tingkatSiasnId}`)
        continue
      }

      const kode = `PD-${String(counter).padStart(4, '0')}`

      await tx.refPendidikan.upsert({
        where: { idSiasn: item.idSiasn },
        update: {
          nama: item.nama,
          tingkatId: tingkat.id
        },
        create: {
          idSiasn: item.idSiasn,
          kode,
          nama: item.nama,
          tingkatId: tingkat.id
        }
      })

      counter++
    }
  })

  console.log('✅ RefPendidikan berhasil diimport (clean)')
}

main()
  .catch(e => {
    console.error('❌ ERROR:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
