import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
  ForbiddenException,
} from '@nestjs/common'
import * as XLSX from 'xlsx'

import { PrismaService } from '@/prisma/prisma.service'
import { normalizeBigInt } from '@/utils/normalizeBigInt'

import {
  type DmsImportStatusValue,
} from './dms-monitoring.constants'
import { CreateDmsBatchDto } from './dto/create-dms-batch.dto'
import { ImportDmsDto } from './dto/import-dms.dto'
import { QueryDmsBatchesDto } from './dto/query-dms-batches.dto'
import { QueryDmsSnapshotsDto } from './dto/query-dms-snapshots.dto'
import { DmsMonitoringRepository } from './dms-monitoring.repository'

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

type ParsedWorkbookResult = {
  rows: ParsedDmsRow[]
  errors: Array<{
    rowNumber: number
    nip: string
    message: string
  }>
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

type DmsMonitoringUser = {
  id?: bigint | string | null
  role?: string | null
  roles?: string[]
  unitKerjaId?: string | null
}

@Injectable()
export class DmsMonitoringService {
  private readonly IMPORT_BATCH_SIZE = 200
  private readonly ALLOWED_EXTENSIONS = new Set(['.xlsx', '.xls'])

  constructor(
    private readonly repo: DmsMonitoringRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createBatch(
    input: CreateDmsBatchDto,
    user?: DmsMonitoringUser,
  ) {
    const importedBy = user?.id
    const scope = await this.resolveUserScope(user)
    const normalizedInput = this.applyManageScope(input, scope)

    const data = await this.repo.createBatch({
      namaFile: normalizedInput.namaFile,
      unorId: normalizedInput.unorId,
      periodeLabel: normalizedInput.periodeLabel,
      catatan: normalizedInput.catatan,
      importedBy,
    })

    if (!data?.id) {
      throw new InternalServerErrorException(
        'Gagal membuat batch import DMS',
      )
    }

    await this.repo.createAuditLog({
      action: 'DMS_BATCH_CREATED',
      entityId: String(data.id),
      payload: {
        namaFile: normalizedInput.namaFile,
        unorId: normalizedInput.unorId ?? null,
        periodeLabel: normalizedInput.periodeLabel ?? null,
      },
      userId: importedBy,
    })

    return normalizeBigInt(data)
  }

  async importFile(
    file: Express.Multer.File,
    input: ImportDmsDto,
    user?: DmsMonitoringUser,
  ) {
    const importedBy = user?.id
    this.validateUploadedFile(file)
    const scope = await this.resolveUserScope(user)
    const normalizedInput = this.applyManageScope(input, scope)

    const parsedWorkbook = this.parseWorkbook(file.buffer)

    if (
      parsedWorkbook.rows.length === 0 &&
      parsedWorkbook.errors.length === 0
    ) {
      throw new UnprocessableEntityException(
        'File Excel tidak memiliki data yang dapat diproses',
      )
    }

    const batch = normalizedInput.batchId
      ? await this.prepareExistingBatch(
          normalizedInput.batchId,
          normalizedInput,
          file.originalname,
          scope,
        )
      : await this.createImportBatch(
          normalizedInput,
          file.originalname,
          importedBy,
        )

    await this.repo.createAuditLog({
      action: 'DMS_IMPORT_STARTED',
      entityId: String(batch.id),
      payload: {
        fileName: file.originalname,
        batchId: String(batch.id),
        autoCreatedBatch: !normalizedInput.batchId,
      },
      userId: importedBy,
    })

    const rowsToImport = this.deduplicateRows(
      parsedWorkbook.rows,
      parsedWorkbook.errors,
    )

    const totalRows =
      rowsToImport.length + parsedWorkbook.errors.length

    if (rowsToImport.length === 0) {
      const finalStatus: DmsImportStatusValue =
        parsedWorkbook.errors.length > 0
          ? 'FAILED'
          : 'DRAFT'

      await this.repo.completeBatch({
        batchId: String(batch.id),
        status: finalStatus,
        totalRows,
        successRows: 0,
        failedRows: parsedWorkbook.errors.length,
        catatan: this.buildImportNote(parsedWorkbook.errors.length),
      })

      await this.repo.createAuditLog({
        action: 'DMS_IMPORT_FAILED',
        entityId: String(batch.id),
        payload: {
          totalRows,
          successRows: 0,
          failedRows: parsedWorkbook.errors.length,
          errors: parsedWorkbook.errors.slice(0, 25),
        },
        userId: importedBy,
      })

      return normalizeBigInt({
        batch,
        summary: await this.repo.getBatchSummary(String(batch.id)),
        imported: {
          totalRows,
          successRows: 0,
          failedRows: parsedWorkbook.errors.length,
          status: finalStatus,
          errors: parsedWorkbook.errors.slice(0, 100),
        },
      })
    }

    const defaultUnorId = this.toBigIntOrNull(normalizedInput.unorId)
    const nips = [...new Set(rowsToImport.map((row) => row.nip))]

    const [pegawaiRows, unorRows] = await Promise.all([
      this.repo.findPegawaiByNips(nips),
      this.repo.findActiveUnorLookup(),
    ])

    const pegawaiMap = new Map<string, PegawaiLookup>(
      pegawaiRows.map((pegawai) => [pegawai.nip, pegawai]),
    )
    const unorMap = this.buildUnorMap(unorRows)

    let successRows = 0
    let failedRows = parsedWorkbook.errors.length
    const errors = [...parsedWorkbook.errors]

    for (
      let index = 0;
      index < rowsToImport.length;
      index += this.IMPORT_BATCH_SIZE
    ) {
      const chunk = rowsToImport.slice(
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
            batchId: BigInt(String(batch.id)),
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

      if (inserts.length === 0) {
        continue
      }

      try {
        await this.repo.insertSnapshots(inserts)
        successRows += inserts.length
      } catch (error) {
        failedRows += inserts.length

        for (const row of chunk) {
          errors.push({
            rowNumber: row.rowNumber,
            nip: row.nip,
            message:
              error instanceof Error
                ? error.message
                : 'Gagal menyimpan snapshot DMS',
          })
        }
      }
    }

    const finalStatus: DmsImportStatusValue =
      failedRows === 0
        ? 'IMPORTED'
        : successRows > 0
          ? 'PARTIAL'
          : 'FAILED'

    await this.repo.completeBatch({
      batchId: String(batch.id),
      status: finalStatus,
      totalRows,
      successRows,
      failedRows,
      catatan: this.buildImportNote(
        failedRows,
        normalizedInput.catatan,
      ),
    })

    await this.repo.createAuditLog({
      action:
        finalStatus === 'IMPORTED'
          ? 'DMS_IMPORT_COMPLETED'
          : finalStatus === 'PARTIAL'
            ? 'DMS_IMPORT_PARTIAL'
            : 'DMS_IMPORT_FAILED',
      entityId: String(batch.id),
      payload: {
        totalRows,
        successRows,
        failedRows,
        status: finalStatus,
        errors: errors.slice(0, 25),
      },
      userId: importedBy,
    })

    const summary = await this.repo.getBatchSummary(String(batch.id))

    return normalizeBigInt({
      batch: await this.repo.getBatchById(String(batch.id)),
      summary,
      imported: {
        totalRows,
        successRows,
        failedRows,
        status: finalStatus,
        errors: errors.slice(0, 100),
      },
    })
  }

  async getBatches(
    query: QueryDmsBatchesDto,
    user?: DmsMonitoringUser,
  ) {
    const scope = await this.resolveUserScope(user)
    const scopedQuery = this.applyReadScopeToQuery(query, scope)
    const data = await this.repo.getBatches(scopedQuery)
    return normalizeBigInt(data)
  }

  async getBatchById(
    id: string,
    user?: DmsMonitoringUser,
  ) {
    const scope = await this.resolveUserScope(user)
    const data = await this.repo.getBatchById(
      id,
      scope.scopedUnorIds,
    )

    if (!data) {
      throw new NotFoundException('Batch DMS tidak ditemukan')
    }

    return normalizeBigInt(data)
  }

  async getBatchSummary(
    id: string,
    user?: DmsMonitoringUser,
  ) {
    const scope = await this.resolveUserScope(user)
    const batch = await this.repo.getBatchById(
      id,
      scope.scopedUnorIds,
    )

    if (!batch) {
      throw new NotFoundException('Batch DMS tidak ditemukan')
    }

    const data = await this.repo.getBatchSummary(
      id,
      scope.scopedUnorIds,
    )
    return normalizeBigInt(data)
  }

  async getSnapshots(
    query: QueryDmsSnapshotsDto,
    user?: DmsMonitoringUser,
  ) {
    const scope = await this.resolveUserScope(user)
    const scopedQuery = this.applyReadScopeToQuery(query, scope)
    const data = await this.repo.getSnapshots(scopedQuery)
    return normalizeBigInt(data)
  }

  async getDashboard(
    unorId?: string,
    user?: DmsMonitoringUser,
  ) {
    const scope = await this.resolveUserScope(user)
    const effectiveUnorId = this.resolveRequestedUnorId(
      unorId,
      scope,
    )
    const data = await this.repo.getDashboard(
      effectiveUnorId,
      scope.scopedUnorIds,
    )
    return normalizeBigInt(data)
  }

  private async createImportBatch(
    input: ImportDmsDto,
    originalName: string,
    importedBy?: bigint | string | null,
  ) {
    const batch = await this.repo.createBatch({
      namaFile: originalName,
      unorId: input.unorId,
      periodeLabel: input.periodeLabel,
      catatan: input.catatan,
      importedBy,
    })

    if (!batch?.id) {
      throw new InternalServerErrorException(
        'Gagal membuat batch import DMS',
      )
    }

    return batch
  }

  private async prepareExistingBatch(
    batchId: string,
    input: ImportDmsDto,
    originalName: string,
    scope: Awaited<
      ReturnType<DmsMonitoringService['resolveUserScope']>
    >,
  ) {
    const batch = await this.repo.getBatchImportContext(batchId)

    if (!batch) {
      throw new NotFoundException('Batch DMS tidak ditemukan')
    }

    if (
      scope.scopedUnorIds &&
      batch.id &&
      !(await this.repo.getBatchById(
        batchId,
        scope.scopedUnorIds,
      ))
    ) {
      throw new ForbiddenException(
        'Batch DMS berada di luar scope unit kerja Anda',
      )
    }

    if (String(batch.status) !== 'DRAFT') {
      throw new ConflictException(
        'Batch DMS hanya dapat diimpor ulang saat masih berstatus DRAFT',
      )
    }

    if (Number(batch.snapshotCount ?? 0) > 0) {
      throw new ConflictException(
        'Batch DMS yang sudah memiliki snapshot tidak dapat diimpor ulang',
      )
    }

    await this.repo.updateBatchMetadata({
      batchId,
      namaFile: originalName,
      unorId: input.unorId,
      periodeLabel: input.periodeLabel,
      catatan: input.catatan,
    })

    const refreshed = await this.repo.getBatchById(batchId)

    if (!refreshed?.id) {
      throw new InternalServerErrorException(
        'Gagal menyiapkan batch import DMS',
      )
    }

    return refreshed
  }

  private validateUploadedFile(file?: Express.Multer.File) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('File Excel wajib diunggah')
    }

    const fileName = file.originalname?.toLowerCase() ?? ''
    const hasValidExtension = [...this.ALLOWED_EXTENSIONS].some(
      (extension) => fileName.endsWith(extension),
    )

    if (!hasValidExtension) {
      throw new BadRequestException(
        'File harus berformat .xlsx atau .xls',
      )
    }
  }

  private isOperator(user?: DmsMonitoringUser) {
    return Boolean(
      user?.role?.toUpperCase() === 'OPERATOR' ||
        user?.roles?.some((role) => role === 'OPERATOR'),
    )
  }

  private async resolveUserScope(user?: DmsMonitoringUser) {
    if (!this.isOperator(user)) {
      return {
        rootUnorId: null as string | null,
        scopedUnorIds: undefined as string[] | undefined,
      }
    }

    const unitKerjaId = user?.unitKerjaId

    if (!unitKerjaId) {
      throw new ForbiddenException(
        'Akun operator belum memiliki scope unit kerja',
      )
    }

    const rootUnorId = await this.resolveOperatorScopeUnorId(
      unitKerjaId,
    )
    const scopedUnorIds = await this.collectScopedUnorIds(
      rootUnorId,
    )

    return {
      rootUnorId,
      scopedUnorIds,
    }
  }

  private async resolveOperatorScopeUnorId(unitKerjaId: string) {
    let current = await this.prisma.refUnor.findUnique({
      where: { id: BigInt(unitKerjaId) },
      select: {
        id: true,
        level: true,
        parentId: true,
      },
    })

    while (current) {
      if (current.level === 2) {
        return current.id.toString()
      }

      if (!current.parentId) {
        break
      }

      current = await this.prisma.refUnor.findUnique({
        where: { id: current.parentId },
        select: {
          id: true,
          level: true,
          parentId: true,
        },
      })
    }

    return unitKerjaId
  }

  private async collectScopedUnorIds(rootUnorId: string) {
    const collected = new Set<string>([rootUnorId])
    let frontier = [BigInt(rootUnorId)]

    while (frontier.length > 0) {
      const children = await this.prisma.refUnor.findMany({
        where: {
          parentId: { in: frontier },
          deletedAt: null,
          isActive: true,
        },
        select: { id: true },
      })

      if (!children.length) {
        break
      }

      frontier = []
      for (const child of children) {
        const id = child.id.toString()
        if (!collected.has(id)) {
          collected.add(id)
          frontier.push(child.id)
        }
      }
    }

    return [...collected]
  }

  private applyManageScope<
    T extends CreateDmsBatchDto | ImportDmsDto,
  >(
    input: T,
    scope: {
      rootUnorId: string | null
      scopedUnorIds?: string[]
    },
  ): T {
    if (!scope.scopedUnorIds || !scope.rootUnorId) {
      return input
    }

    if (
      input.unorId &&
      !scope.scopedUnorIds.includes(input.unorId)
    ) {
      throw new ForbiddenException(
        'Unit organisasi berada di luar scope operator',
      )
    }

    return {
      ...input,
      unorId: input.unorId ?? scope.rootUnorId,
    }
  }

  private applyReadScopeToQuery<
    T extends QueryDmsBatchesDto | QueryDmsSnapshotsDto,
  >(
    query: T,
    scope: {
      rootUnorId: string | null
      scopedUnorIds?: string[]
    },
  ) {
    if (!scope.scopedUnorIds || !scope.rootUnorId) {
      return query
    }

    if (
      query.unorId &&
      !scope.scopedUnorIds.includes(query.unorId)
    ) {
      throw new ForbiddenException(
        'Filter unit organisasi berada di luar scope operator',
      )
    }

    return {
      ...query,
      scopedUnorIds: scope.scopedUnorIds,
    }
  }

  private resolveRequestedUnorId(
    requestedUnorId: string | undefined,
    scope: {
      rootUnorId: string | null
      scopedUnorIds?: string[]
    },
  ) {
    if (!scope.scopedUnorIds || !scope.rootUnorId) {
      return requestedUnorId
    }

    if (!requestedUnorId) {
      return undefined
    }

    if (!scope.scopedUnorIds.includes(requestedUnorId)) {
      throw new ForbiddenException(
        'Filter dashboard berada di luar scope operator',
      )
    }

    return requestedUnorId
  }

  private parseWorkbook(buffer: Buffer): ParsedWorkbookResult {
    let workbook: XLSX.WorkBook
    try {
      workbook = XLSX.read(buffer, {
        type: 'buffer',
        cellDates: false,
      })
    } catch {
      throw new UnprocessableEntityException(
        'File Excel tidak valid atau tidak dapat dibaca',
      )
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]]

    if (!sheet) {
      throw new UnprocessableEntityException(
        'Sheet Excel tidak ditemukan',
      )
    }

    this.validateSheetHeaders(sheet)

    const rows = XLSX.utils.sheet_to_json<RawExcelRow>(sheet, {
      defval: '',
      raw: false,
    })

    const parsed: ParsedWorkbookResult = {
      rows: [],
      errors: [],
    }

    rows.forEach((row, index) => {
      const rowNumber = index + 2
      const result = this.parseRow(row, rowNumber)

      if (!result) {
        return
      }

      if ('error' in result) {
        parsed.errors.push(result.error)
        return
      }

      parsed.rows.push(result.row)
    })

    return parsed
  }

  private validateSheetHeaders(sheet: XLSX.WorkSheet) {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: '',
      blankrows: false,
    })

    const headerRow = Array.isArray(rows[0]) ? rows[0] : []
    const normalizedHeaders = new Set(
      headerRow
        .map((cell) => this.normalizeHeaderName(cell))
        .filter((header): header is string => Boolean(header)),
    )

    const requiredHeaders = ['nip', 'nama', 'unit kerja']
    const missingHeaders = requiredHeaders.filter(
      (header) => !normalizedHeaders.has(header),
    )

    if (missingHeaders.length > 0) {
      throw new UnprocessableEntityException(
        `Template Excel tidak valid. Header wajib yang belum ada: ${missingHeaders.join(', ')}`,
      )
    }
  }

  private parseRow(
    row: RawExcelRow,
    rowNumber: number,
  ):
    | { row: ParsedDmsRow }
    | {
        error: {
          rowNumber: number
          nip: string
          message: string
        }
      }
    | null {
    const nip = this.normalizeText(row.NIP)
    const namaSnapshot = this.normalizeText(row.Nama)
    const unitKerjaRaw = this.normalizeText(row['Unit Kerja'])

    if (!nip && !namaSnapshot && !unitKerjaRaw) {
      return null
    }

    if (!nip) {
      return {
        error: {
          rowNumber,
          nip: '-',
          message: 'NIP kosong',
        },
      }
    }

    if (!namaSnapshot) {
      return {
        error: {
          rowNumber,
          nip,
          message: 'Nama kosong',
        },
      }
    }

    return {
      row: {
        rowNumber,
        nip,
        namaSnapshot,
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
      },
    }
  }

  private deduplicateRows(
    rows: ParsedDmsRow[],
    errors: Array<{
      rowNumber: number
      nip: string
      message: string
    }>,
  ) {
    const seen = new Set<string>()
    const deduped: ParsedDmsRow[] = []

    for (const row of rows) {
      if (seen.has(row.nip)) {
        errors.push({
          rowNumber: row.rowNumber,
          nip: row.nip,
          message: 'NIP duplikat dalam file import',
        })
        continue
      }

      seen.add(row.nip)
      deduped.push(row)
    }

    return deduped
  }

  private buildUnorMap(units: UnorLookup[]) {
    return new Map<string, UnorLookup>(
      units.map((unit) => [
        this.normalizeUnitName(unit.nama),
        unit,
      ]),
    )
  }

  private buildImportNote(
    failedRows: number,
    fallbackNote?: string,
  ) {
    if (failedRows > 0) {
      return `Terdapat ${failedRows} baris gagal diproses`
    }

    return fallbackNote ?? null
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

  private normalizeHeaderName(value: unknown) {
    const normalized = this.normalizeText(value)
    return normalized?.toLowerCase() ?? null
  }

  private toBooleanFlag(value: unknown) {
    if (typeof value === 'boolean') {
      return value
    }

    const normalized = String(value ?? '')
      .trim()
      .toLowerCase()

    return [
      '✓',
      '✔',
      'check',
      'checked',
      'v',
      'yes',
      'y',
      '1',
      'true',
    ].includes(normalized)
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
