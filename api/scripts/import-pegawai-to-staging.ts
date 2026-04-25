import { Prisma, PrismaClient } from "@prisma/client"
import * as XLSX from "xlsx"
import * as path from "node:path"

const prisma = new PrismaClient()

const FILE_PATH = path.resolve(process.cwd(), "data/import/data-utama.xlsx")

function cleanString(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null
  }

  const cleaned = String(value)
    .replace(/^'/, "")
    .replace(/\u00A0/g, " ")
    .trim()

  return cleaned.length > 0 ? cleaned : null
}

function buildBatchCode(): string {
  const now = new Date()
  const stamp = now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)

  return `PEG-${stamp}`
}

function toInputJsonObject(row: Record<string, unknown>): Prisma.InputJsonObject {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => {
      if (value === null || value === undefined) {
        return [key, null]
      }

      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        return [key, value]
      }

      if (value instanceof Date) {
        return [key, value.toISOString()]
      }

      return [key, String(value)]
    })
  ) as Prisma.InputJsonObject
}

async function main(): Promise<void> {
  const workbook = XLSX.readFile(FILE_PATH)
  const sheetName = workbook.SheetNames[0]

  if (!sheetName) {
    throw new Error("File Excel tidak memiliki sheet.")
  }

  const sheet = workbook.Sheets[sheetName]

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
    raw: true
  })

  const batchCode = buildBatchCode()

  const batch = await prisma.silakapPegawaiImportBatch.create({
    data: {
      batchCode,
      fileName: path.basename(FILE_PATH),
      totalRows: rows.length,
      validRows: 0,
      invalidRows: 0,
      importedRows: 0,
      status: "DRAFT"
    }
  })

  const batchSize = 500

  for (let index = 0; index < rows.length; index += batchSize) {
    const chunk = rows.slice(index, index + batchSize)

    await prisma.silakapPegawaiImportStaging.createMany({
      data: chunk.map((row, chunkIndex) => {
        return {
          batchId: batch.id,
          rowNumber: index + chunkIndex + 2,

          nip: cleanString(row["NIP BARU"]),
          nik: cleanString(row["NIK"]),
          nama: cleanString(row["NAMA"]),
          siasnId: cleanString(row["PNS ID"]),

          rawData: toInputJsonObject(row),

          isValid: false,
          isImported: false
        }
      }),
      skipDuplicates: true
    })

    console.log(`Batch row ${index + 1} - ${index + chunk.length} masuk staging`)
  }

  console.log("Import staging selesai")
  console.log({
    batchId: batch.id.toString(),
    batchCode,
    totalRows: rows.length
  })
}

main()
  .catch((error: unknown) => {
    console.error("Import staging gagal:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })