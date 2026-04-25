import { Prisma, PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const BATCH_CODE = process.argv[2]

type ValidationError = {
  field: string
  message: string
}

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

function toJsonArray(errors: ValidationError[]): Prisma.InputJsonArray {
  return errors.map((error) => ({
    field: error.field,
    message: error.message
  }))
}

function getRawValue(
  rawData: Prisma.JsonValue,
  key: string
): unknown {
  if (
    rawData &&
    typeof rawData === "object" &&
    !Array.isArray(rawData)
  ) {
    return (rawData as Record<string, unknown>)[key]
  }

  return null
}

async function loadRefMap(
  model: {
    findMany: (args: {
      select: { idSiasn: true }
    }) => Promise<Array<{ idSiasn: string | null }>>
  }
): Promise<Set<string>> {
  const rows = await model.findMany({
    select: {
      idSiasn: true
    }
  })

  return new Set(
    rows
      .map((row) => row.idSiasn)
      .filter((value): value is string => Boolean(value))
  )
}

async function main(): Promise<void> {
  if (!BATCH_CODE) {
    throw new Error(
      "Batch code wajib diisi. Contoh: npm run pegawai:validate:staging -- PEG-20260425082802"
    )
  }

  const batch = await prisma.silakapPegawaiImportBatch.findUnique({
    where: {
      batchCode: BATCH_CODE
    }
  })

  if (!batch) {
    throw new Error(`Batch ${BATCH_CODE} tidak ditemukan.`)
  }

  const [
    agamaMap,
    jenisKelaminMap,
    statusPerkawinanMap,
    jenisPegawaiMap,
    kedudukanHukumMap,
    golonganMap,
    jenisJabatanMap,
    jabatanMap,
    pendidikanTingkatMap,
    pendidikanMap,
    tempatLahirMap,
    kpknMap,
    lokasiKerjaMap,
    unorMap,
    instansiMap,
    satkerMap
  ] = await Promise.all([
    loadRefMap(prisma.refAgama),
    loadRefMap(prisma.refJenisKelamin),
    loadRefMap(prisma.refStatusPerkawinan),
    loadRefMap(prisma.refJenisPegawai),
    loadRefMap(prisma.refKedudukanHukum),
    loadRefMap(prisma.refGolongan),
    loadRefMap(prisma.refJenisJabatan),
    loadRefMap(prisma.refJabatan),
    loadRefMap(prisma.refPendidikanTingkat),
    loadRefMap(prisma.refPendidikan),
    loadRefMap(prisma.refTempatLahir),
    loadRefMap(prisma.refKpkn),
    loadRefMap(prisma.refLokasiKerja),
    loadRefMap(prisma.refUnor),
    loadRefMap(prisma.refInstansi),
    loadRefMap(prisma.refSatker)
  ])

  const rows = await prisma.silakapPegawaiImportStaging.findMany({
    where: {
      batchId: batch.id
    },
    orderBy: {
      rowNumber: "asc"
    }
  })

  const nipCount = new Map<string, number>()

  for (const row of rows) {
    if (row.nip) {
      nipCount.set(row.nip, (nipCount.get(row.nip) ?? 0) + 1)
    }
  }

  let validRows = 0
  let invalidRows = 0

  for (const row of rows) {
    const errors: ValidationError[] = []

    const nip = row.nip
    const nik = row.nik
    const nama = row.nama

    if (!nip) {
      errors.push({
        field: "NIP BARU",
        message: "NIP wajib diisi."
      })
    }

    if (nip && nipCount.get(nip)! > 1) {
      errors.push({
        field: "NIP BARU",
        message: "NIP duplikat dalam batch import."
      })
    }

    if (!nama) {
      errors.push({
        field: "NAMA",
        message: "Nama wajib diisi."
      })
    }

    if (nik && nik.length !== 16) {
      errors.push({
        field: "NIK",
        message: "NIK harus 16 digit."
      })
    }

    const rawData = row.rawData

    const checks: Array<{
      field: string
      value: string | null
      map: Set<string>
      label: string
      required: boolean
    }> = [
      {
        field: "AGAMA ID",
        value: cleanString(getRawValue(rawData, "AGAMA ID")),
        map: agamaMap,
        label: "Agama",
        required: false
      },
      {
        field: "JENIS KELAMIN",
        value: cleanString(getRawValue(rawData, "JENIS KELAMIN")),
        map: jenisKelaminMap,
        label: "Jenis kelamin",
        required: false
      },
      {
        field: "JENIS KAWIN ID",
        value: cleanString(getRawValue(rawData, "JENIS KAWIN ID")),
        map: statusPerkawinanMap,
        label: "Status perkawinan",
        required: false
      },
      {
        field: "JENIS PEGAWAI ID",
        value: cleanString(getRawValue(rawData, "JENIS PEGAWAI ID")),
        map: jenisPegawaiMap,
        label: "Jenis pegawai",
        required: false
      },
      {
        field: "KEDUDUKAN HUKUM ID",
        value: cleanString(getRawValue(rawData, "KEDUDUKAN HUKUM ID")),
        map: kedudukanHukumMap,
        label: "Kedudukan hukum",
        required: false
      },
      {
        field: "GOL AKHIR ID",
        value: cleanString(getRawValue(rawData, "GOL AKHIR ID")),
        map: golonganMap,
        label: "Golongan akhir",
        required: true
      },
      {
        field: "JENIS JABATAN ID",
        value: cleanString(getRawValue(rawData, "JENIS JABATAN ID")),
        map: jenisJabatanMap,
        label: "Jenis jabatan",
        required: true
      },
      {
        field: "JABATAN ID",
        value: cleanString(getRawValue(rawData, "JABATAN ID")),
        map: jabatanMap,
        label: "Jabatan",
        required: true
      },
      {
        field: "TINGKAT PENDIDIKAN ID",
        value: cleanString(getRawValue(rawData, "TINGKAT PENDIDIKAN ID")),
        map: pendidikanTingkatMap,
        label: "Tingkat pendidikan",
        required: false
      },
      {
        field: "PENDIDIKAN ID",
        value: cleanString(getRawValue(rawData, "PENDIDIKAN ID")),
        map: pendidikanMap,
        label: "Pendidikan",
        required: false
      },
      {
        field: "TEMPAT LAHIR ID",
        value: cleanString(getRawValue(rawData, "TEMPAT LAHIR ID")),
        map: tempatLahirMap,
        label: "Tempat lahir",
        required: false
      },
      {
        field: "KPKN ID",
        value: cleanString(getRawValue(rawData, "KPKN ID")),
        map: kpknMap,
        label: "KPKN",
        required: false
      },
      {
        field: "LOKASI KERJA ID",
        value: cleanString(getRawValue(rawData, "LOKASI KERJA ID")),
        map: lokasiKerjaMap,
        label: "Lokasi kerja",
        required: false
      },
      {
        field: "UNOR ID",
        value: cleanString(getRawValue(rawData, "UNOR ID")),
        map: unorMap,
        label: "Unor",
        required: true
      },
      {
        field: "INSTANSI INDUK ID",
        value: cleanString(getRawValue(rawData, "INSTANSI INDUK ID")),
        map: instansiMap,
        label: "Instansi induk",
        required: false
      },
      {
        field: "INSTANSI KERJA ID",
        value: cleanString(getRawValue(rawData, "INSTANSI KERJA ID")),
        map: instansiMap,
        label: "Instansi kerja",
        required: false
      },
      {
        field: "SATUAN KERJA INDUK ID",
        value: cleanString(getRawValue(rawData, "SATUAN KERJA INDUK ID")),
        map: satkerMap,
        label: "Satuan kerja induk",
        required: false
      },
      {
        field: "SATUAN KERJA KERJA ID",
        value: cleanString(getRawValue(rawData, "SATUAN KERJA KERJA ID")),
        map: satkerMap,
        label: "Satuan kerja kerja",
        required: false
      }
    ]

    for (const check of checks) {
      if (check.required && !check.value) {
        errors.push({
          field: check.field,
          message: `${check.label} wajib diisi.`
        })
      }

      if (check.value && !check.map.has(check.value)) {
        errors.push({
          field: check.field,
          message: `${check.label} tidak ditemukan di tabel referensi.`
        })
      }
    }

    const isValid = errors.length === 0

    if (isValid) {
      validRows += 1
    } else {
      invalidRows += 1
    }

    await prisma.silakapPegawaiImportStaging.update({
      where: {
        id: row.id
      },
      data: {
        isValid,
        errors: isValid ? Prisma.JsonNull : toJsonArray(errors)
      }
    })
  }

  await prisma.silakapPegawaiImportBatch.update({
    where: {
      id: batch.id
    },
    data: {
      validRows,
      invalidRows,
      status: invalidRows > 0 ? "VALIDATED_WITH_ERROR" : "VALIDATED",
      errors:
        invalidRows > 0
          ? {
              message: "Sebagian data staging tidak valid.",
              invalidRows
            }
          : Prisma.JsonNull
    }
  })

  console.log("Validasi staging selesai")
  console.log({
    batchCode: BATCH_CODE,
    totalRows: rows.length,
    validRows,
    invalidRows
  })
}

main()
  .catch((error: unknown) => {
    console.error("Validasi staging gagal:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })