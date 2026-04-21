import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { PrismaService } from '@/prisma/prisma.service'

import { QueryDmsBatchesDto } from './dto/query-dms-batches.dto'
import { QueryDmsSnapshotsDto } from './dto/query-dms-snapshots.dto'

type DmsBatchRow = {
  id: bigint
  namaFile: string
  unorId: bigint | null
  unorNama: string | null
  periodeLabel: string | null
  status: string
  totalRows: number
  successRows: number
  failedRows: number
  catatan: string | null
  importedBy: bigint | null
  importedByUsername: string | null
  importedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

type DmsBatchImportContextRow = {
  id: bigint
  status: string
  snapshotCount: bigint
}

type DmsBatchCountRow = {
  total: bigint
}

type DmsBatchSummaryAggregateRow = {
  totalAsn: bigint
  matchedPegawai: bigint
  matchedUnor: bigint
  avgSkorArsip: number | null
  latestSync: Date | null
}

type DmsKategoriCountRow = {
  kategori: string | null
  total: bigint
}

type DmsDokumenStatsRow = {
  drh: bigint
  cpns: bigint
  d2np: bigint
  spmt: bigint
  pns: bigint
}

type DmsSnapshotRow = {
  id: bigint
  batchId: bigint
  pegawaiId: bigint | null
  nip: string
  namaSnapshot: string
  unorId: bigint | null
  unorNama: string | null
  unitKerjaRaw: string | null
  drh: boolean
  cpns: boolean
  d2np: boolean
  spmt: boolean
  pns: boolean
  skorArsip: Prisma.Decimal | number | null
  kategoriKelengkapan: string | null
  lastSync: Date | null
  isMatchedPegawai: boolean
  isMatchedUnor: boolean
  createdAt: Date
  updatedAt: Date
}

type DmsDashboardByUnorRow = {
  unorId: bigint | null
  unorNama: string | null
  totalAsn: bigint
  avgSkorArsip: number | null
  latestSync: Date | null
}

type DmsScopeParams = {
  scopedUnorIds?: string[]
}

type CreateDmsBatchParams = {
  namaFile: string
  unorId?: string | number | bigint | null
  periodeLabel?: string | null
  catatan?: string | null
  importedBy?: bigint | string | null
}

type UpdateDmsBatchMetadataParams = {
  batchId: string
  namaFile: string
  unorId?: string | number | bigint | null
  periodeLabel?: string | null
  catatan?: string | null
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

type CreateAuditLogParams = {
  action: string
  entityId?: string | null
  payload?: Prisma.InputJsonValue | null
  userId?: bigint | string | null
}

@Injectable()
export class DmsMonitoringRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createBatch(params: CreateDmsBatchParams) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw(Prisma.sql`
        INSERT INTO silakap_dms_batch (
          nama_file,
          unor_id,
          periode_label,
          status,
          total_rows,
          success_rows,
          failed_rows,
          catatan,
          imported_by,
          imported_at,
          created_at,
          updated_at
        ) VALUES (
          ${params.namaFile},
          ${this.toBigIntOrNull(params.unorId)},
          ${params.periodeLabel ?? null},
          ${'DRAFT'},
          ${0},
          ${0},
          ${0},
          ${params.catatan ?? null},
          ${this.toBigIntOrNull(params.importedBy)},
          ${new Date()},
          ${new Date()},
          ${new Date()}
        )
      `)

      const inserted = await tx.$queryRaw<DmsBatchRow[]>(Prisma.sql`
        SELECT
          b.id,
          b.nama_file AS namaFile,
          b.unor_id AS unorId,
          u.nama AS unorNama,
          b.periode_label AS periodeLabel,
          b.status,
          b.total_rows AS totalRows,
          b.success_rows AS successRows,
          b.failed_rows AS failedRows,
          b.catatan,
          b.imported_by AS importedBy,
          usr.username AS importedByUsername,
          b.imported_at AS importedAt,
          b.created_at AS createdAt,
          b.updated_at AS updatedAt
        FROM silakap_dms_batch b
        LEFT JOIN ref_unor u ON u.id = b.unor_id
        LEFT JOIN silakap_user usr ON usr.id = b.imported_by
        WHERE b.id = LAST_INSERT_ID()
        LIMIT 1
      `)

      return inserted[0] ?? null
    })
  }

  async updateBatchMetadata(params: UpdateDmsBatchMetadataParams) {
    await this.prisma.$executeRaw(Prisma.sql`
      UPDATE silakap_dms_batch
      SET
        nama_file = ${params.namaFile},
        unor_id = COALESCE(${this.toBigIntOrNull(params.unorId)}, unor_id),
        periode_label = COALESCE(${params.periodeLabel ?? null}, periode_label),
        catatan = COALESCE(${params.catatan ?? null}, catatan),
        updated_at = ${new Date()}
      WHERE id = ${BigInt(params.batchId)}
    `)
  }

  async getBatchImportContext(batchId: string) {
    const rows = await this.prisma.$queryRaw<DmsBatchImportContextRow[]>(
      Prisma.sql`
      SELECT
        b.id,
        b.status,
        COUNT(s.id) AS snapshotCount
      FROM silakap_dms_batch b
      LEFT JOIN silakap_dms_snapshot s ON s.batch_id = b.id
      WHERE b.id = ${BigInt(batchId)}
      GROUP BY b.id, b.status
      LIMIT 1
    `)

    return rows[0] ?? null
  }

  async completeBatch(params: {
    batchId: string
    status: string
    totalRows: number
    successRows: number
    failedRows: number
    catatan?: string | null
  }) {
    await this.prisma.$executeRaw(Prisma.sql`
      UPDATE silakap_dms_batch
      SET
        status = ${params.status},
        total_rows = ${params.totalRows},
        success_rows = ${params.successRows},
        failed_rows = ${params.failedRows},
        catatan = ${params.catatan ?? null},
        imported_at = ${new Date()},
        updated_at = ${new Date()}
      WHERE id = ${BigInt(params.batchId)}
    `)

    return this.getBatchById(params.batchId)
  }

  async insertSnapshots(rows: SnapshotInsertInput[]) {
    if (!rows.length) {
      return
    }

    const now = new Date()
    const values = rows.map((row) => Prisma.sql`(
      ${row.batchId},
      ${row.pegawaiId ?? null},
      ${row.nip},
      ${row.namaSnapshot},
      ${row.unorId ?? null},
      ${row.unitKerjaRaw ?? null},
      ${row.drh},
      ${row.cpns},
      ${row.d2np},
      ${row.spmt},
      ${row.pns},
      ${row.skorArsip ?? null},
      ${row.kategoriKelengkapan ?? null},
      ${row.lastSync ?? null},
      ${row.isMatchedPegawai},
      ${row.isMatchedUnor},
      ${now},
      ${now}
    )`)

    await this.prisma.$executeRaw(Prisma.sql`
      INSERT INTO silakap_dms_snapshot (
        batch_id,
        pegawai_id,
        nip,
        nama_snapshot,
        unor_id,
        unit_kerja_raw,
        drh,
        cpns,
        d2np,
        spmt,
        pns,
        skor_arsip,
        kategori_kelengkapan,
        last_sync,
        is_matched_pegawai,
        is_matched_unor,
        created_at,
        updated_at
      ) VALUES ${Prisma.join(values)}
    `)
  }

  async createAuditLog(params: CreateAuditLogParams) {
    await this.prisma.auditLog.create({
      data: {
        action: params.action,
        entity: 'DMS_MONITORING',
        entityId: params.entityId ?? null,
        payload: params.payload ?? undefined,
        userId: this.toBigIntOrNull(params.userId),
        createdAt: new Date(),
      },
    })
  }

  async findPegawaiByNips(nips: string[]) {
    if (!nips.length) {
      return []
    }

    return this.prisma.$queryRaw<
      Array<{
        id: bigint
        nip: string
        unorId: bigint | null
      }>
    >(Prisma.sql`
      SELECT
        p.id,
        p.nip,
        p.unor_id AS unorId
      FROM silakap_pegawai p
      WHERE p.nip IN (${Prisma.join(nips)})
    `)
  }

  async findActiveUnorLookup() {
    return this.prisma.$queryRaw<
      Array<{
        id: bigint
        nama: string
      }>
    >(Prisma.sql`
      SELECT
        u.id,
        u.nama
      FROM ref_unor u
      WHERE u.deleted_at IS NULL
        AND u.is_active = true
      ORDER BY u.nama ASC
    `)
  }

  async getBatches(
    params: QueryDmsBatchesDto & DmsScopeParams,
  ) {
    const page = this.toPage(params.page)
    const limit = this.toLimit(params.limit)
    const offset = (page - 1) * limit
    const whereClause = this.buildBatchWhereClause(params)

    const data = await this.prisma.$queryRaw<DmsBatchRow[]>(Prisma.sql`
      SELECT
        b.id,
        b.nama_file AS namaFile,
        b.unor_id AS unorId,
        u.nama AS unorNama,
        b.periode_label AS periodeLabel,
        b.status,
        b.total_rows AS totalRows,
        b.success_rows AS successRows,
        b.failed_rows AS failedRows,
        b.catatan,
        b.imported_by AS importedBy,
        usr.username AS importedByUsername,
        b.imported_at AS importedAt,
        b.created_at AS createdAt,
        b.updated_at AS updatedAt
      FROM silakap_dms_batch b
      LEFT JOIN ref_unor u ON u.id = b.unor_id
      LEFT JOIN silakap_user usr ON usr.id = b.imported_by
      ${whereClause}
      ORDER BY b.id DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `)

    const totalRows = await this.prisma.$queryRaw<DmsBatchCountRow[]>(
      Prisma.sql`
      SELECT COUNT(*) AS total
      FROM silakap_dms_batch b
      ${whereClause}
    `)

    const total = Number(totalRows[0]?.total ?? 0n)

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getBatchById(
    id: string,
    scopedUnorIds?: string[],
  ) {
    const scopeClause = this.buildSingleBatchScopeClause(scopedUnorIds)

    const data = await this.prisma.$queryRaw<DmsBatchRow[]>(Prisma.sql`
      SELECT
        b.id,
        b.nama_file AS namaFile,
        b.unor_id AS unorId,
        u.nama AS unorNama,
        b.periode_label AS periodeLabel,
        b.status,
        b.total_rows AS totalRows,
        b.success_rows AS successRows,
        b.failed_rows AS failedRows,
        b.catatan,
        b.imported_by AS importedBy,
        usr.username AS importedByUsername,
        b.imported_at AS importedAt,
        b.created_at AS createdAt,
        b.updated_at AS updatedAt
      FROM silakap_dms_batch b
      LEFT JOIN ref_unor u ON u.id = b.unor_id
      LEFT JOIN silakap_user usr ON usr.id = b.imported_by
      WHERE b.id = ${BigInt(id)}
      ${scopeClause}
      LIMIT 1
    `)

    return data[0] ?? null
  }

  async getBatchSummary(
    id: string,
    scopedUnorIds?: string[],
  ) {
    const batchId = BigInt(id)
    const scopeClause = this.buildSnapshotScopeClause(scopedUnorIds)

    const summary =
      await this.prisma.$queryRaw<DmsBatchSummaryAggregateRow[]>(
        Prisma.sql`
      SELECT
        COUNT(*) AS totalAsn,
        SUM(CASE WHEN s.is_matched_pegawai = 1 THEN 1 ELSE 0 END) AS matchedPegawai,
        SUM(CASE WHEN s.is_matched_unor = 1 THEN 1 ELSE 0 END) AS matchedUnor,
        AVG(s.skor_arsip) AS avgSkorArsip,
        MAX(s.last_sync) AS latestSync
      FROM silakap_dms_snapshot s
      WHERE s.batch_id = ${batchId}
      ${scopeClause}
    `)

    const byKategori =
      await this.prisma.$queryRaw<DmsKategoriCountRow[]>(
        Prisma.sql`
      SELECT
        s.kategori_kelengkapan AS kategori,
        COUNT(*) AS total
      FROM silakap_dms_snapshot s
      WHERE s.batch_id = ${batchId}
      ${scopeClause}
      GROUP BY s.kategori_kelengkapan
      ORDER BY total DESC
    `)

    const dokumenStats =
      await this.prisma.$queryRaw<DmsDokumenStatsRow[]>(
        Prisma.sql`
      SELECT
        SUM(CASE WHEN s.drh = 1 THEN 1 ELSE 0 END) AS drh,
        SUM(CASE WHEN s.cpns = 1 THEN 1 ELSE 0 END) AS cpns,
        SUM(CASE WHEN s.d2np = 1 THEN 1 ELSE 0 END) AS d2np,
        SUM(CASE WHEN s.spmt = 1 THEN 1 ELSE 0 END) AS spmt,
        SUM(CASE WHEN s.pns = 1 THEN 1 ELSE 0 END) AS pns
      FROM silakap_dms_snapshot s
      WHERE s.batch_id = ${batchId}
      ${scopeClause}
    `)

    return {
      summary: summary[0] ?? {
        totalAsn: 0n,
        matchedPegawai: 0n,
        matchedUnor: 0n,
        avgSkorArsip: null,
        latestSync: null,
      },
      byKategori,
      dokumenStats: dokumenStats[0] ?? {
        drh: 0n,
        cpns: 0n,
        d2np: 0n,
        spmt: 0n,
        pns: 0n,
      },
    }
  }

  async getSnapshots(
    params: QueryDmsSnapshotsDto & DmsScopeParams,
  ) {
    const page = this.toPage(params.page)
    const limit = this.toLimit(params.limit)
    const offset = (page - 1) * limit
    const whereClause = this.buildSnapshotWhereClause(params)

    const data = await this.prisma.$queryRaw<DmsSnapshotRow[]>(
      Prisma.sql`
      SELECT
        s.id,
        s.batch_id AS batchId,
        s.pegawai_id AS pegawaiId,
        s.nip,
        s.nama_snapshot AS namaSnapshot,
        s.unor_id AS unorId,
        u.nama AS unorNama,
        s.unit_kerja_raw AS unitKerjaRaw,
        s.drh,
        s.cpns,
        s.d2np,
        s.spmt,
        s.pns,
        s.skor_arsip AS skorArsip,
        s.kategori_kelengkapan AS kategoriKelengkapan,
        s.last_sync AS lastSync,
        s.is_matched_pegawai AS isMatchedPegawai,
        s.is_matched_unor AS isMatchedUnor,
        s.created_at AS createdAt,
        s.updated_at AS updatedAt
      FROM silakap_dms_snapshot s
      LEFT JOIN ref_unor u ON u.id = s.unor_id
      ${whereClause}
      ORDER BY
        CASE WHEN s.skor_arsip IS NULL THEN 1 ELSE 0 END ASC,
        s.skor_arsip ASC,
        s.nama_snapshot ASC,
        s.id ASC
      LIMIT ${limit}
      OFFSET ${offset}
    `)

    const totalRows = await this.prisma.$queryRaw<DmsBatchCountRow[]>(
      Prisma.sql`
      SELECT COUNT(*) AS total
      FROM silakap_dms_snapshot s
      ${whereClause}
    `)

    const total = Number(totalRows[0]?.total ?? 0n)

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getDashboard(
    unorId?: string,
    scopedUnorIds?: string[],
  ) {
    const whereClause = this.buildDashboardWhereClause(
      unorId,
      scopedUnorIds,
    )

    const summary =
      await this.prisma.$queryRaw<DmsBatchSummaryAggregateRow[]>(
        Prisma.sql`
      SELECT
        COUNT(*) AS totalAsn,
        SUM(CASE WHEN s.is_matched_pegawai = 1 THEN 1 ELSE 0 END) AS matchedPegawai,
        SUM(CASE WHEN s.is_matched_unor = 1 THEN 1 ELSE 0 END) AS matchedUnor,
        AVG(s.skor_arsip) AS avgSkorArsip,
        MAX(s.last_sync) AS latestSync
      FROM silakap_dms_snapshot s
      ${whereClause}
    `)

    const byKategori =
      await this.prisma.$queryRaw<DmsKategoriCountRow[]>(
        Prisma.sql`
      SELECT
        s.kategori_kelengkapan AS kategori,
        COUNT(*) AS total
      FROM silakap_dms_snapshot s
      ${whereClause}
      GROUP BY s.kategori_kelengkapan
      ORDER BY total DESC
    `)

    const dokumenStats =
      await this.prisma.$queryRaw<DmsDokumenStatsRow[]>(
        Prisma.sql`
      SELECT
        SUM(CASE WHEN s.drh = 1 THEN 1 ELSE 0 END) AS drh,
        SUM(CASE WHEN s.cpns = 1 THEN 1 ELSE 0 END) AS cpns,
        SUM(CASE WHEN s.d2np = 1 THEN 1 ELSE 0 END) AS d2np,
        SUM(CASE WHEN s.spmt = 1 THEN 1 ELSE 0 END) AS spmt,
        SUM(CASE WHEN s.pns = 1 THEN 1 ELSE 0 END) AS pns
      FROM silakap_dms_snapshot s
      ${whereClause}
    `)

    const byUnor =
      await this.prisma.$queryRaw<DmsDashboardByUnorRow[]>(
        Prisma.sql`
      SELECT
        s.unor_id AS unorId,
        u.nama AS unorNama,
        COUNT(*) AS totalAsn,
        AVG(s.skor_arsip) AS avgSkorArsip,
        MAX(s.last_sync) AS latestSync
      FROM silakap_dms_snapshot s
      LEFT JOIN ref_unor u ON u.id = s.unor_id
      ${whereClause}
      GROUP BY s.unor_id, u.nama
      ORDER BY totalAsn DESC
      LIMIT 10
    `)

    return {
      summary: summary[0] ?? {
        totalAsn: 0n,
        matchedPegawai: 0n,
        matchedUnor: 0n,
        avgSkorArsip: null,
        latestSync: null,
      },
      byKategori,
      dokumenStats: dokumenStats[0] ?? {
        drh: 0n,
        cpns: 0n,
        d2np: 0n,
        spmt: 0n,
        pns: 0n,
      },
      byUnor,
    }
  }

  private buildBatchWhereClause(
    params: QueryDmsBatchesDto & DmsScopeParams,
  ) {
    const conditions: Prisma.Sql[] = []

    if (params.scopedUnorIds?.length) {
      conditions.push(
        Prisma.sql`b.unor_id IN (${Prisma.join(
          params.scopedUnorIds.map((id) => BigInt(id)),
        )})`,
      )
    }

    if (params.unorId) {
      conditions.push(
        Prisma.sql`b.unor_id = ${BigInt(params.unorId)}`,
      )
    }

    if (params.status) {
      conditions.push(Prisma.sql`b.status = ${params.status}`)
    }

    return conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(
          conditions,
          ' AND ',
        )}`
      : Prisma.sql``
  }

  private buildSnapshotWhereClause(
    params: QueryDmsSnapshotsDto & DmsScopeParams,
  ) {
    const conditions: Prisma.Sql[] = []

    if (params.scopedUnorIds?.length) {
      conditions.push(
        Prisma.sql`s.unor_id IN (${Prisma.join(
          params.scopedUnorIds.map((id) => BigInt(id)),
        )})`,
      )
    }

    if (params.batchId) {
      conditions.push(
        Prisma.sql`s.batch_id = ${BigInt(params.batchId)}`,
      )
    }

    if (params.unorId) {
      conditions.push(
        Prisma.sql`s.unor_id = ${BigInt(params.unorId)}`,
      )
    }

    if (params.kategori) {
      conditions.push(
        Prisma.sql`s.kategori_kelengkapan = ${params.kategori}`,
      )
    }

    if (params.nip) {
      conditions.push(
        Prisma.sql`(s.nip LIKE ${`%${params.nip}%`} OR s.nama_snapshot LIKE ${`%${params.nip}%`})`,
      )
    }

    return conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(
          conditions,
          ' AND ',
        )}`
      : Prisma.sql``
  }

  private buildSingleBatchScopeClause(scopedUnorIds?: string[]) {
    if (!scopedUnorIds?.length) {
      return Prisma.sql``
    }

    return Prisma.sql`AND b.unor_id IN (${Prisma.join(
      scopedUnorIds.map((id) => BigInt(id)),
    )})`
  }

  private buildSnapshotScopeClause(scopedUnorIds?: string[]) {
    if (!scopedUnorIds?.length) {
      return Prisma.sql``
    }

    return Prisma.sql`AND s.unor_id IN (${Prisma.join(
      scopedUnorIds.map((id) => BigInt(id)),
    )})`
  }

  private buildDashboardWhereClause(
    unorId?: string,
    scopedUnorIds?: string[],
  ) {
    const conditions: Prisma.Sql[] = []

    if (scopedUnorIds?.length) {
      conditions.push(
        Prisma.sql`s.unor_id IN (${Prisma.join(
          scopedUnorIds.map((id) => BigInt(id)),
        )})`,
      )
    }

    if (unorId) {
      conditions.push(
        Prisma.sql`s.unor_id = ${BigInt(unorId)}`,
      )
    }

    return conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(
          conditions,
          ' AND ',
        )}`
      : Prisma.sql``
  }

  private toPage(value?: number) {
    const page = Number(value ?? 1)
    return Number.isFinite(page) && page > 0 ? page : 1
  }

  private toLimit(value?: number) {
    const limit = Number(value ?? 20)
    if (!Number.isFinite(limit) || limit <= 0) {
      return 20
    }

    return Math.min(limit, 100)
  }

  private toBigIntOrNull(
    value?: string | number | bigint | null,
  ) {
    if (value === undefined || value === null || value === '') {
      return null
    }

    return BigInt(value)
  }
}
