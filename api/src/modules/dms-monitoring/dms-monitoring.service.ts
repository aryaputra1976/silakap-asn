import { Injectable } from '@nestjs/common'
import * as XLSX from 'xlsx'

import { normalizeBigInt } from '@/utils/normalizeBigInt'

import { DmsMonitoringRepository } from './dms-monitoring.repository'

type CreateDmsBatchInput = {
  namaFile: string
  unorId?: string | number | null
  periodeLabel?: string | null
  catatan?: string | null
}

type ImportDmsInput = {
  unorId?: string | number | null
  periodeLabel?: string | null
  catatan?: string | null
}

type BatchQuery = {
  unorId?: string
  status?: string
  page?: string
  limit?: string
}

type SnapshotQuery = {
  batchId?: string
  unorId?: string
  kategori?: string
  nip?: string
  page?: string
  limit?: string
}

type RawExcelRow = {
  No?: string | number
  NIP?: string | number
  Nama?: string
  'Unit Kerja'?: string
  DRH?: string | number | boolean
  CPNS?: string | number | boolean
  D2NP?: string | number | boolean
  SPMT?: string | number | boolean
  PNS?: string | number | boolean
  'Skor Arsip'?: string | number
  'Kategori Kelengkapan'?: string
  Last_Sync?: string | number | Date
}

type ParsedDmsRow = {
  rowNumber: number
  nip: string
  namaSnapshot: string
  unitKerjaRaw: string | null
  drh: boolean
  cpns: boolean
  d2np: boolean
  spmt: boolean
  pns: boolean
  skorArsip: number | null
  kategoriKelengkapan: string | null
  lastSync: Date | null
}

type SnapshotInsertInput = {
  batchId: bigint
  pegawaiId?: bigint | null
  nip: string
  namaSnapshot: string
  unorId?: bigint | null
  unitKerjaRaw?: string | null
  drh: boolean
  cpns: boolean
  d2np: boolean
  spmt: boolean
  pns: boolean
  skorArsip?: number | null
  kategoriKelengkapan?: string | null
  lastSync?: Date | null
  isMatchedPegawai: boolean
  isMatchedUnor: boolean
}

type PegawaiLookup = {
  id: bigint
  nip: string
  unorId: bigint | null
}

type UnorLookup = {
  id: bigint
  nama: string
}

@Injectable()
export class DmsMonitoringService {
  private readonly IMPORT_BATCH_SIZE = 200

  constructor(
    private readonly repo: DmsMonitoringRepository,
  ) {}

  async createBatch(
    input: CreateDmsBatchInput,
    importedBy?: bigint | string | null,
  ) {
    const data = await this.repo.createBatch({
      namaFile: input.namaFile,
      unorId: input.unorId,
      periodeLabel: input.periodeLabel,
      catatan: input.catatan,
      importedBy,
    })

    return normalizeBigInt(data)
  }

  async importFile(
    file: Express.Multer.File,
    input: ImportDmsInput,
    importedBy?: bigint | string | null,
  ) {
    if (!file?.buffer?.length) {
      throw new Error('File Excel wajib diunggah')
    }

    const parsedRows = this.parseWorkbook(file.buffer)

    if (!parsedRows.length) {
      throw new Error('File Excel tidak memiliki data yang valid')
    }

    const batch = await this.repo.createBatch({
      namaFile: file.originalname,
      unorId: input.unorId,
      periodeLabel: input.periodeLabel,
      catatan: input.catatan,
      importedBy,
    })

    if (!batch?.id) {
      throw new Error('Gagal membuat batch import DMS')
    }

    const defaultUnorId = this.toBigIntOrNull(input.unorId)
    const nips = [...new Set(parsedRows.map((row) => row.nip))]

    const [pegawaiRows, unorRows] = await Promise.all([
      this.repo.findPegawaiByNips(nips),
      this.repo.findActiveUnorLookup(),
    ])

    const pegawaiMap = new Map<string, PegawaiLookup>(
      pegawaiRows.map((pegawai) => [pegawai.nip, pegawai]),
    )

    const unorMap = this.buildUnorMap(unorRows)

    let successRows = 0
    let failedRows = 0
    const errors: Array<{
      rowNumber: number
      nip: string
      message: string
    }> = []

    for (
      let index = 0;
      index < parsedRows.length;
      index += this.IMPORT_BATCH_SIZE
    ) {
      const chunk = parsedRows.slice(
        index,
        index + this.IMPORT_BATCH_SIZE,
      )

      const inserts: SnapshotInsertInput[] = []

      for (const row of chunk) {
        try {
          const pegawai = pegawaiMap.get(row.nip)
          const mappedUnor = row.unitKerjaRaw
            ? unorMap.get(this.normalizeUnitName(row.unitKerjaRaw))
            : undefined

          const chosenUnorId =
            pegawai?.unorId ?? mappedUnor?.id ?? defaultUnorId

          inserts.push({
            batchId: batch.id as bigint,
            pegawaiId: pegawai?.id ?? null,
            nip: row.nip,
            namaSnapshot: row.namaSnapshot,
            unorId: chosenUnorId ?? null,
            unitKerjaRaw: row.unitKerjaRaw,
            drh: row.drh,
            cpns: row.cpns,
            d2np: row.d2np,
            spmt: row.spmt,
            pns: row.pns,
            skorArsip: row.skorArsip,
            kategoriKelengkapan: row.kategoriKelengkapan,
            lastSync: row.lastSync,
            isMatchedPegawai: Boolean(pegawai),
            isMatchedUnor: Boolean(chosenUnorId),
          })

          successRows += 1
        } catch (error) {
          failedRows += 1
          errors.push({
            rowNumber: row.rowNumber,
            nip: row.nip,
            message:
              error instanceof Error
                ? error.message
                : 'Gagal memproses baris DMS',
          })
        }
      }

      if (inserts.length > 0) {
        await this.repo.insertSnapshots(inserts)
      }
    }

    const finalStatus =
      failedRows === 0
        ? 'IMPORTED'
        : successRows > 0
          ? 'PARTIAL'
          : 'FAILED'

    await this.repo.completeBatch({
      batchId: String(batch.id),
      status: finalStatus,
      totalRows: parsedRows.length,
      successRows,
      failedRows,
      catatan:
        errors.length > 0
          ? `Terdapat ${errors.length} baris gagal diproses`
          : input.catatan ?? null,
    })

    const summary = await this.repo.getBatchSummary(String(batch.id))

    return normalizeBigInt({
      batch,
      summary,
      imported: {
        totalRows: parsedRows.length,
        successRows,
        failedRows,
        status: finalStatus,
        errors: errors.slice(0, 100),
      },
    })
  }

  async getBatches(query: BatchQuery) {
    const data = await this.repo.getBatches({
      unorId: query.unorId,
      status: query.status,
      page: query.page,
      limit: query.limit,
    })

    return normalizeBigInt(data)
  }

  async getBatchById(id: string) {
    const data = await this.repo.getBatchById(id)
    return normalizeBigInt(data)
  }

  async getBatchSummary(id: string) {
    const data = await this.repo.getBatchSummary(id)
    return normalizeBigInt(data)
  }

  async getSnapshots(query: SnapshotQuery) {
    const data = await this.repo.getSnapshots({
      batchId: query.batchId,
      unorId: query.unorId,
      kategori: query.kategori,
      nip: query.nip,
      page: query.page,
      limit: query.limit,
    })

    return normalizeBigInt(data)
  }

  async getDashboard(unorId?: string) {
    const data = await this.repo.getDashboard(unorId)
    return normalizeBigInt(data)
  }

  private parseWorkbook(buffer: Buffer) {
    const workbook = XLSX.read(buffer, {
      type: 'buffer',
      cellDates: false,
    })

    const sheet = workbook.Sheets[workbook.SheetNames[0]]

    if (!sheet) {
      return []
    }

    const rows = XLSX.utils.sheet_to_json<RawExcelRow>(sheet, {
      defval: '',
      raw: false,
    })

    return rows
      .map((row, index) => this.parseRow(row, index + 2))
      .filter((row): row is ParsedDmsRow => row !== null)
  }

  private parseRow(
    row: RawExcelRow,
    rowNumber: number,
  ): ParsedDmsRow | null {
    const nip = this.normalizeText(row.NIP)
    const namaSnapshot = this.normalizeText(row.Nama)
    const unitKerjaRaw = this.normalizeText(row['Unit Kerja'])

    if (!nip && !namaSnapshot && !unitKerjaRaw) {
      return null
    }

    if (!nip) {
      throw new Error(`NIP kosong pada baris ${rowNumber}`)
    }

    return {
      rowNumber,
      nip,
      namaSnapshot: namaSnapshot ?? '',
      unitKerjaRaw,
      drh: this.toBooleanFlag(row.DRH),
      cpns: this.toBooleanFlag(row.CPNS),
      d2np: this.toBooleanFlag(row.D2NP),
      spmt: this.toBooleanFlag(row.SPMT),
      pns: this.toBooleanFlag(row.PNS),
      skorArsip: this.toNumber(row['Skor Arsip']),
      kategoriKelengkapan: this.normalizeText(
        row['Kategori Kelengkapan'],
      ),
      lastSync: this.toDate(row.Last_Sync),
    }
  }

  private buildUnorMap(units: UnorLookup[]) {
    return new Map<string, UnorLookup>(
      units.map((unit) => [
        this.normalizeUnitName(unit.nama),
        unit,
      ]),
    )
  }

  private normalizeUnitName(value: string) {
    return value
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private normalizeText(value: unknown) {
    if (value === undefined || value === null) {
      return null
    }

    const text = String(value).trim()
    return text.length > 0 ? text : null
  }

  private toBooleanFlag(value: unknown) {
    if (typeof value === 'boolean') {
      return value
    }

    const normalized = String(value ?? '')
      .trim()
      .toLowerCase()

    return ['✓', '✔', 'v', 'yes', 'y', '1', 'true'].includes(
      normalized,
    )
  }

  private toNumber(value: unknown) {
    if (value === undefined || value === null || value === '') {
      return null
    }

    const normalized = String(value).replace(',', '.').trim()
    const parsed = Number(normalized)

    return Number.isFinite(parsed) ? parsed : null
  }

  private toDate(value: unknown) {
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value
    }

    const text = this.normalizeText(value)
    if (!text) {
      return null
    }

    const normalized = text.replace(/\./g, ':')
    const direct = new Date(normalized)

    if (!Number.isNaN(direct.getTime())) {
      return direct
    }

    const match = normalized.match(
      /^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2}))?$/,
    )

    if (!match) {
      return null
    }

    const [, day, month, year, hour = '00', minute = '00'] = match
    const parsed = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
    )

    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  private toBigIntOrNull(value?: string | number | null) {
    if (value === undefined || value === null || value === '') {
      return null
    }

    return BigInt(value)
  }
}
