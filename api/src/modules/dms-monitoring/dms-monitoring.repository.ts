import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { PrismaService } from '@/prisma/prisma.service'

type CreateDmsBatchParams = {
  namaFile: string
  unorId?: string | number | bigint | null
  periodeLabel?: string | null
  catatan?: string | null
  importedBy?: bigint | string | null
}

type BatchQueryParams = {
  unorId?: string
  status?: string
  page?: string
  limit?: string
}

type SnapshotQueryParams = {
  batchId?: string
  unorId?: string
  kategori?: string
  nip?: string
  page?: string
  limit?: string
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

      const inserted = await tx.$queryRaw<
        Array<Record<string, unknown>>
      >(Prisma.sql`
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
          b.imported_at AS importedAt,
          b.created_at AS createdAt,
          b.updated_at AS updatedAt
        FROM silakap_dms_batch b
        LEFT JOIN ref_unor u ON u.id = b.unor_id
        WHERE b.id = LAST_INSERT_ID()
        LIMIT 1
      `)

      return inserted[0] ?? null
    })
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

    await this.prisma.$transaction(async (tx) => {
      for (const row of rows) {
        await tx.$executeRaw(Prisma.sql`
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
          ) VALUES (
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
            ${new Date()},
            ${new Date()}
          )
        `)
      }
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

  async getBatches(params: BatchQueryParams) {
    const page = this.toPage(params.page)
    const limit = this.toLimit(params.limit)
    const offset = (page - 1) * limit
    const whereClause = this.buildBatchWhereClause(params)

    const data = await this.prisma.$queryRaw<
      Array<Record<string, unknown>>
    >(Prisma.sql`
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
        b.imported_at AS importedAt,
        b.created_at AS createdAt,
        b.updated_at AS updatedAt
      FROM silakap_dms_batch b
      LEFT JOIN ref_unor u ON u.id = b.unor_id
      ${whereClause}
      ORDER BY b.id DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `)

    const totalRows = await this.prisma.$queryRaw<
      Array<{ total: bigint }>
    >(Prisma.sql`
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

  async getBatchById(id: string) {
    const data = await this.prisma.$queryRaw<
      Array<Record<string, unknown>>
    >(Prisma.sql`
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
        b.imported_at AS importedAt,
        b.created_at AS createdAt,
        b.updated_at AS updatedAt
      FROM silakap_dms_batch b
      LEFT JOIN ref_unor u ON u.id = b.unor_id
      WHERE b.id = ${BigInt(id)}
      LIMIT 1
    `)

    return data[0] ?? null
  }

  async getBatchSummary(id: string) {
    const batchId = BigInt(id)

    const summary = await this.prisma.$queryRaw<
      Array<{
        totalAsn: bigint
        matchedPegawai: bigint
        matchedUnor: bigint
        avgSkorArsip: number | null
        latestSync: Date | null
      }>
    >(Prisma.sql`
      SELECT
        COUNT(*) AS totalAsn,
        SUM(CASE WHEN s.is_matched_pegawai = 1 THEN 1 ELSE 0 END) AS matchedPegawai,
        SUM(CASE WHEN s.is_matched_unor = 1 THEN 1 ELSE 0 END) AS matchedUnor,
        AVG(s.skor_arsip) AS avgSkorArsip,
        MAX(s.last_sync) AS latestSync
      FROM silakap_dms_snapshot s
      WHERE s.batch_id = ${batchId}
    `)

    const byKategori = await this.prisma.$queryRaw<
      Array<{ kategori: string | null; total: bigint }>
    >(Prisma.sql`
      SELECT
        s.kategori_kelengkapan AS kategori,
        COUNT(*) AS total
      FROM silakap_dms_snapshot s
      WHERE s.batch_id = ${batchId}
      GROUP BY s.kategori_kelengkapan
      ORDER BY total DESC
    `)

    const dokumenStats = await this.prisma.$queryRaw<
      Array<{
        drh: bigint
        cpns: bigint
        d2np: bigint
        spmt: bigint
        pns: bigint
      }>
    >(Prisma.sql`
      SELECT
        SUM(CASE WHEN s.drh = 1 THEN 1 ELSE 0 END) AS drh,
        SUM(CASE WHEN s.cpns = 1 THEN 1 ELSE 0 END) AS cpns,
        SUM(CASE WHEN s.d2np = 1 THEN 1 ELSE 0 END) AS d2np,
        SUM(CASE WHEN s.spmt = 1 THEN 1 ELSE 0 END) AS spmt,
        SUM(CASE WHEN s.pns = 1 THEN 1 ELSE 0 END) AS pns
      FROM silakap_dms_snapshot s
      WHERE s.batch_id = ${batchId}
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

  async getSnapshots(params: SnapshotQueryParams) {
    const page = this.toPage(params.page)
    const limit = this.toLimit(params.limit)
    const offset = (page - 1) * limit
    const whereClause = this.buildSnapshotWhereClause(params)

    const data = await this.prisma.$queryRaw<
      Array<Record<string, unknown>>
    >(Prisma.sql`
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
      ORDER BY s.id DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `)

    const totalRows = await this.prisma.$queryRaw<
      Array<{ total: bigint }>
    >(Prisma.sql`
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

  async getDashboard(unorId?: string) {
    const whereClause = unorId
      ? Prisma.sql`WHERE s.unor_id = ${BigInt(unorId)}`
      : Prisma.sql``

    const summary = await this.prisma.$queryRaw<
      Array<{
        totalAsn: bigint
        matchedPegawai: bigint
        matchedUnor: bigint
        avgSkorArsip: number | null
        latestSync: Date | null
      }>
    >(Prisma.sql`
      SELECT
        COUNT(*) AS totalAsn,
        SUM(CASE WHEN s.is_matched_pegawai = 1 THEN 1 ELSE 0 END) AS matchedPegawai,
        SUM(CASE WHEN s.is_matched_unor = 1 THEN 1 ELSE 0 END) AS matchedUnor,
        AVG(s.skor_arsip) AS avgSkorArsip,
        MAX(s.last_sync) AS latestSync
      FROM silakap_dms_snapshot s
      ${whereClause}
    `)

    const byKategori = await this.prisma.$queryRaw<
      Array<{ kategori: string | null; total: bigint }>
    >(Prisma.sql`
      SELECT
        s.kategori_kelengkapan AS kategori,
        COUNT(*) AS total
      FROM silakap_dms_snapshot s
      ${whereClause}
      GROUP BY s.kategori_kelengkapan
      ORDER BY total DESC
    `)

    const dokumenStats = await this.prisma.$queryRaw<
      Array<{
        drh: bigint
        cpns: bigint
        d2np: bigint
        spmt: bigint
        pns: bigint
      }>
    >(Prisma.sql`
      SELECT
        SUM(CASE WHEN s.drh = 1 THEN 1 ELSE 0 END) AS drh,
        SUM(CASE WHEN s.cpns = 1 THEN 1 ELSE 0 END) AS cpns,
        SUM(CASE WHEN s.d2np = 1 THEN 1 ELSE 0 END) AS d2np,
        SUM(CASE WHEN s.spmt = 1 THEN 1 ELSE 0 END) AS spmt,
        SUM(CASE WHEN s.pns = 1 THEN 1 ELSE 0 END) AS pns
      FROM silakap_dms_snapshot s
      ${whereClause}
    `)

    const byUnor = await this.prisma.$queryRaw<
      Array<Record<string, unknown>>
    >(Prisma.sql`
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

  private buildBatchWhereClause(params: BatchQueryParams) {
    const conditions: Prisma.Sql[] = []

    if (params.unorId) {
      conditions.push(
        Prisma.sql`b.unor_id = ${BigInt(params.unorId)}`,
      )
    }

    if (params.status) {
      conditions.push(
        Prisma.sql`b.status = ${params.status.toUpperCase()}`,
      )
    }

    return conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.sql``
  }

  private buildSnapshotWhereClause(params: SnapshotQueryParams) {
    const conditions: Prisma.Sql[] = []

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
        Prisma.sql`s.nip LIKE ${`%${params.nip}%`}`,
      )
    }

    return conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.sql``
  }

  private toPage(value?: string) {
    const page = Number(value ?? 1)
    return Number.isFinite(page) && page > 0 ? page : 1
  }

  private toLimit(value?: string) {
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
