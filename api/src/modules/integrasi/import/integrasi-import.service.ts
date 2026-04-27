import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { IntegrasiImportMapper } from './integrasi-import.mapper';
import { IntegrasiImportRepository } from './integrasi-import.repository';
import type {
  QueryImportBatchDto,
  QueryImportErrorsDto,
} from './dto/query-import-batch.dto';
import {
  CANCEL_ALLOWED_STATUSES,
  COMMIT_ALLOWED_STATUSES,
  INTEGRASI_IMPORT_EVENT,
  INTEGRASI_IMPORT_STATUS,
  VALIDATE_ALLOWED_STATUSES,
  type IntegrasiImportStatus,
} from './integrasi-import-status.constant';
import type { Express } from 'express';
import * as XLSX from 'xlsx';
import { UpdateImportRowDto } from './dto/update-import-row.dto';

type MissingReferenceItem = {
  value: string;
  name: string | null;
  count: number;
  sampleRows: number[];
};

type ReferenceCandidate = {
  value: string;
  name: string | null;
  count: number;
  sampleRows: number[];
};

type ValidationErrorItem = {
  field: string;
  code: string;
  message: string;
  value?: string;
};

type ReferenceType = 'jabatan' | 'unor' | 'pendidikan';

type ParsedImportRow = {
  rowNumber: number;
  rawData: Prisma.JsonObject;
  mappedData: Prisma.JsonObject;
  nip: string | null;
  nik: string | null;
  nama: string | null;
  siasnId: string | null;
};

type CreateImportBatchPayload = {
  batchCode: string;
  fileName: string;
  totalRows: number;
  status: string;
  errors: Prisma.InputJsonValue;
  rows: {
    rowNumber: number;
    rawData: Prisma.InputJsonValue;
    mappedData: Prisma.InputJsonValue;
    nip: string | null;
    nik: string | null;
    nama: string | null;
    siasnId: string | null;
    isValid: boolean;
    isImported: boolean;
  }[];
};

@Injectable()
export class IntegrasiImportService {
  constructor(private readonly repository: IntegrasiImportRepository) {}

  async findBatches(query: QueryImportBatchDto) {
    const result = await this.repository.findBatches(query);

    return {
      data: result.items.map(IntegrasiImportMapper.toBatchListItem),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  async findBatchDetail(batchId: bigint) {
    const batch = await this.repository.findBatchById(batchId);

    if (!batch) {
      throw new NotFoundException('Batch import tidak ditemukan');
    }

    return IntegrasiImportMapper.toBatchDetail(batch);
  }

  async findErrorRows(batchId: bigint, query: QueryImportErrorsDto) {
    await this.ensureBatchExists(batchId);

    const result = await this.repository.findErrorRows(batchId, query);

    return {
      data: result.items.map(IntegrasiImportMapper.toErrorRow),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  async updateImportRow(rowId: bigint, dto: UpdateImportRowDto) {
    const row = await this.repository.findStagingRowById(rowId);

    if (!row) {
      throw new NotFoundException('Row import tidak ditemukan');
    }

    if (row.isImported) {
      throw new ConflictException(
        'Row sudah diimport dan tidak dapat diperbaiki lagi',
      );
    }

    const editableStatuses: readonly IntegrasiImportStatus[] = [
      INTEGRASI_IMPORT_STATUS.DRAFT,
      INTEGRASI_IMPORT_STATUS.VALIDATED_WITH_ERROR,
      INTEGRASI_IMPORT_STATUS.FAILED,
    ];

    if (!editableStatuses.includes(row.batch.status as IntegrasiImportStatus)) {
      throw new ConflictException(
        'Row hanya dapat diperbaiki pada batch berstatus DRAFT, VALIDATED_WITH_ERROR, atau FAILED',
      );
    }

    const hasPayload =
      dto.nip !== undefined ||
      dto.nik !== undefined ||
      dto.nama !== undefined ||
      dto.siasnId !== undefined ||
      dto.rawData !== undefined ||
      dto.mappedData !== undefined;

    if (!hasPayload) {
      throw new BadRequestException('Minimal satu field wajib dikirim');
    }

    const currentRawData = this.toSafeJsonObject(row.rawData);
    const currentMappedData = this.toSafeJsonObject(row.mappedData);

    const nextNip =
      dto.nip !== undefined ? this.cleanOptionalString(dto.nip) : row.nip;
    const nextNik =
      dto.nik !== undefined ? this.cleanOptionalString(dto.nik) : row.nik;
    const nextNama =
      dto.nama !== undefined ? this.cleanOptionalString(dto.nama) : row.nama;
    const nextSiasnId =
      dto.siasnId !== undefined
        ? this.cleanOptionalString(dto.siasnId)
        : row.siasnId;

    const nextRawData: Prisma.JsonObject = {
      ...currentRawData,
      ...this.toSafeJsonObject(dto.rawData),
    };

    const nextMappedData: Prisma.JsonObject = {
      ...currentMappedData,
      ...this.toSafeJsonObject(dto.mappedData),
      ...(dto.nip !== undefined ? { nip: nextNip } : {}),
      ...(dto.nik !== undefined ? { nik: nextNik } : {}),
      ...(dto.nama !== undefined ? { nama: nextNama } : {}),
      ...(dto.siasnId !== undefined ? { siasnId: nextSiasnId } : {}),
    };

    const updated = await this.repository.updateImportRowAndResetBatch(
      rowId,
      row.batchId,
      {
        nip: nextNip,
        nik: nextNik,
        nama: nextNama,
        siasnId: nextSiasnId,
        rawData: nextRawData,
        mappedData: nextMappedData,
      },
      this.buildAuditEvent('IMPORT_ROW_UPDATED', {
        rowId: rowId.toString(),
        batchId: row.batchId.toString(),
        previousStatus: row.batch.status,
        nextStatus: INTEGRASI_IMPORT_STATUS.DRAFT,
        message: 'Row staging diperbaiki manual dan batch wajib divalidasi ulang',
      }),
    );

    return {
      row: IntegrasiImportMapper.toErrorRow(updated),
      message:
        'Row berhasil diperbaiki. Silakan jalankan validasi ulang sebelum commit.',
    };
  }

  async findMissingReferences(batchId: bigint) {
    await this.ensureBatchExists(batchId);

    const references = await this.buildMissingReferences(batchId);

    return {
      jabatan: references.jabatan,
      unor: references.unor,
      pendidikan: references.pendidikan,
    };
  }

  async createMissingReferences(batchId: bigint, referenceType: ReferenceType) {
    await this.ensureBatchExists(batchId);

    const references = await this.buildMissingReferences(batchId);
    const candidates = references[referenceType].filter(
      (item) => item.name !== null && item.name.trim().length > 0,
    );

    if (candidates.length === 0) {
      return {
        batchId: batchId.toString(),
        referenceType,
        created: 0,
        skipped: references[referenceType].length,
        message:
          'Tidak ada referensi yang dapat dibuat karena nama referensi tidak tersedia di staging',
      };
    }

    if (referenceType === 'jabatan') {
      const rows = await this.repository.findRowsForValidation(batchId);

      const jabatanMap = new Map<
        string,
        {
          idSiasn: string;
          nama: string;
          jenisJabatanSiasnId: string | null;
          jenisJabatanNama: string | null;
        }
      >();

      for (const row of rows) {
        const jabatanId = this.extractFirstValue(row.mappedData, row.rawData, [
          'jabatanId',
          'jabatan_id',
          'JABATAN ID',
          'JABATAN_ID',
        ]);

        const jabatanNama = this.extractFirstValue(row.mappedData, row.rawData, [
          'jabatanNama',
          'jabatan_nama',
          'JABATAN NAMA',
          'JABATAN_NAMA',
        ]);

        const jenisJabatanSiasnId = this.extractFirstValue(row.mappedData, row.rawData, [
          'jenisJabatanId',
          'jenis_jabatan_id',
          'JENIS JABATAN ID',
          'JENIS_JABATAN_ID',
        ]);

        const jenisJabatanNama = this.extractFirstValue(row.mappedData, row.rawData, [
          'jenisJabatanNama',
          'jenis_jabatan_nama',
          'JENIS JABATAN NAMA',
          'JENIS_JABATAN_NAMA',
        ]);

        if (!jabatanId || !jabatanNama) continue;
        if (!references.jabatan.some((item) => item.value === jabatanId)) continue;

        jabatanMap.set(jabatanId, {
          idSiasn: jabatanId,
          nama: jabatanNama,
          jenisJabatanSiasnId,
          jenisJabatanNama,
        });
      }

      const created = await this.repository.createJabatanReferences([
        ...jabatanMap.values(),
      ]);

      return {
        batchId: batchId.toString(),
        referenceType,
        created,
        skipped: references.jabatan.length - jabatanMap.size,
      };
    }

    if (referenceType === 'unor') {
      const created = await this.repository.createUnorReferences(
        candidates.map((item) => ({
          idSiasn: item.value,
          nama: item.name ?? '',
        })),
      );

      return {
        batchId: batchId.toString(),
        referenceType,
        created,
        skipped: references[referenceType].length - candidates.length,
      };
    }

    if (referenceType === 'pendidikan') {
      const rows = await this.repository.findRowsForValidation(batchId);

      const pendidikanMap = new Map<
        string,
        {
          idSiasn: string;
          nama: string;
          tingkatSiasnId: string | null;
          tingkatNama: string | null;
        }
      >();

      for (const row of rows) {
        const pendidikanId = this.extractFirstValue(row.mappedData, row.rawData, [
          'pendidikanId',
          'pendidikan_id',
          'PENDIDIKAN ID',
          'PENDIDIKAN_ID',
        ]);

        const pendidikanNama = this.extractFirstValue(row.mappedData, row.rawData, [
          'pendidikanNama',
          'pendidikan_nama',
          'PENDIDIKAN NAMA',
          'PENDIDIKAN_NAMA',
        ]);

        const tingkatId = this.extractFirstValue(row.mappedData, row.rawData, [
          'tingkatPendidikanId',
          'tingkat_pendidikan_id',
          'TINGKAT PENDIDIKAN ID',
          'TINGKAT_PENDIDIKAN_ID',
        ]);

        const tingkatNama = this.extractFirstValue(row.mappedData, row.rawData, [
          'tingkatPendidikanNama',
          'tingkat_pendidikan_nama',
          'TINGKAT PENDIDIKAN NAMA',
          'TINGKAT_PENDIDIKAN_NAMA',
        ]);

        if (!pendidikanId || !pendidikanNama) continue;
        if (!references.pendidikan.some((item) => item.value === pendidikanId)) continue;

        pendidikanMap.set(pendidikanId, {
          idSiasn: pendidikanId,
          nama: pendidikanNama,
          tingkatSiasnId: tingkatId,
          tingkatNama,
        });
      }

      const created = await this.repository.createPendidikanReferences([
        ...pendidikanMap.values(),
      ]);

      return {
        batchId: batchId.toString(),
        referenceType,
        created,
        skipped: references.pendidikan.length - pendidikanMap.size,
      };
    }
  }

async validateBatch(batchId: bigint) {
  const batch = await this.repository.findBatchById(batchId);

  if (!batch) {
    throw new NotFoundException('Batch import tidak ditemukan');
  }

  this.assertStatusAllowed(
    batch.status,
    VALIDATE_ALLOWED_STATUSES,
    'VALIDATE',
  );

  const locked = await this.repository.transitionBatchStatus(
    batchId,
    VALIDATE_ALLOWED_STATUSES,
    INTEGRASI_IMPORT_STATUS.VALIDATING,
    this.buildAuditEvent(INTEGRASI_IMPORT_EVENT.VALIDATE_STARTED, {
      previousStatus: batch.status,
    }),
  );

  if (!locked) {
    throw new ConflictException(
      'Batch sedang diproses oleh proses lain. Silakan muat ulang data',
    );
  }

  try {
    const rows = await this.repository.findRowsForValidation(batchId);

    const jabatanCandidates = new Set<string>();
    const unorCandidates = new Set<string>();
    const pendidikanCandidates = new Set<string>();

    const preparedRows = rows.map((row) => {
      const jabatanId = this.extractFirstValue(row.mappedData, row.rawData, [
        'jabatanId',
        'jabatan_id',
        'JABATAN ID',
        'idJabatan',
        'id_jabatan',
        'jabatanSiasnId',
        'jabatan_siasn_id',
        'JABATAN_ID',
      ]);

      const unorId = this.extractFirstValue(row.mappedData, row.rawData, [
        'unorId',
        'unor_id',
        'UNOR ID',
        'idUnor',
        'id_unor',
        'unorSiasnId',
        'unor_siasn_id',
        'UNOR_ID',
      ]);

      const pendidikanId = this.extractFirstValue(row.mappedData, row.rawData, [
        'pendidikanId',
        'pendidikan_id',
        'PENDIDIKAN ID',
        'idPendidikan',
        'id_pendidikan',
        'pendidikanSiasnId',
        'pendidikan_siasn_id',
        'PENDIDIKAN_ID',
      ]);

      if (jabatanId) jabatanCandidates.add(jabatanId);
      if (unorId) unorCandidates.add(unorId);
      if (pendidikanId) pendidikanCandidates.add(pendidikanId);

      return {
        row,
        jabatanId,
        unorId,
        pendidikanId,
      };
    });

    const [existingJabatan, existingUnor, existingPendidikan] =
      await Promise.all([
        this.repository.findExistingJabatanKeys([...jabatanCandidates]),
        this.repository.findExistingUnorKeys([...unorCandidates]),
        this.repository.findExistingPendidikanKeys([...pendidikanCandidates]),
      ]);

    const existingJabatanSet = this.toExistingKeySet(existingJabatan);
    const existingUnorSet = this.toExistingKeySet(existingUnor);
    const existingPendidikanSet = this.toExistingKeySet(existingPendidikan);

    let validRows = 0;
    let invalidRows = 0;

    const validationRows = preparedRows.map((item) => {
      const errors: ValidationErrorItem[] = [];

      if (!item.row.nip?.trim()) {
        errors.push({
          field: 'nip',
          code: 'NIP_REQUIRED',
          message: 'NIP wajib diisi',
        });
      }

      if (!item.row.nama?.trim()) {
        errors.push({
          field: 'nama',
          code: 'NAMA_REQUIRED',
          message: 'Nama wajib diisi',
        });
      }

      if (item.jabatanId && !existingJabatanSet.has(item.jabatanId)) {
        errors.push({
          field: 'jabatanId',
          code: 'JABATAN_NOT_FOUND',
          message: 'JABATAN ID tidak ditemukan di ref_jabatan',
          value: item.jabatanId,
        });
      }

      if (item.unorId && !existingUnorSet.has(item.unorId)) {
        errors.push({
          field: 'unorId',
          code: 'UNOR_NOT_FOUND',
          message: 'UNOR ID tidak ditemukan di ref_unor',
          value: item.unorId,
        });
      }

      if (item.pendidikanId && !existingPendidikanSet.has(item.pendidikanId)) {
        errors.push({
          field: 'pendidikanId',
          code: 'PENDIDIKAN_NOT_FOUND',
          message: 'PENDIDIKAN ID tidak ditemukan di ref_pendidikan',
          value: item.pendidikanId,
        });
      }

      const isValid = errors.length === 0;

      if (isValid) {
        validRows += 1;
      } else {
        invalidRows += 1;
      }

      return {
        id: item.row.id,
        isValid,
        errors: isValid ? Prisma.JsonNull : errors,
      };
    });

    const status =
      invalidRows > 0
        ? INTEGRASI_IMPORT_STATUS.VALIDATED_WITH_ERROR
        : INTEGRASI_IMPORT_STATUS.VALIDATED;

    await this.repository.updateValidationResult(batchId, validationRows, {
      validRows,
      invalidRows,
      status,
      errors: this.buildAuditEvent(INTEGRASI_IMPORT_EVENT.VALIDATE_SUCCESS, {
        totalRows: rows.length,
        validRows,
        invalidRows,
      }),
    });

    return {
      batchId: batchId.toString(),
      totalRows: rows.length,
      validRows,
      invalidRows,
      status,
    };
  } catch (error) {
    await this.repository.updateBatchStatus(
      batchId,
      INTEGRASI_IMPORT_STATUS.FAILED,
      this.buildAuditEvent(INTEGRASI_IMPORT_EVENT.VALIDATE_FAILED, {
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    );

    throw error;
  }
}

async commitBatch(batchId: bigint) {
  const batch = await this.repository.findBatchById(batchId);

  if (!batch) {
    throw new NotFoundException('Batch import tidak ditemukan');
  }

  if (batch.status === INTEGRASI_IMPORT_STATUS.IMPORTED) {
    throw new ConflictException('Batch ini sudah pernah diimport');
  }

  this.assertStatusAllowed(batch.status, COMMIT_ALLOWED_STATUSES, 'COMMIT');

  if (batch.invalidRows > 0) {
    throw new BadRequestException(
      'Batch masih memiliki data invalid. Lengkapi referensi dan validasi ulang sebelum commit',
    );
  }

  const invalidRows = await this.repository.countInvalidRows(batchId);

  if (invalidRows > 0) {
    throw new BadRequestException(
      'Masih terdapat row invalid di staging. Commit dibatalkan',
    );
  }

  const pendingValidRows = await this.repository.countPendingValidRows(batchId);

  if (pendingValidRows === 0) {
    throw new BadRequestException('Tidak ada data valid yang perlu diimport');
  }

  const locked = await this.repository.transitionBatchStatus(
    batchId,
    COMMIT_ALLOWED_STATUSES,
    INTEGRASI_IMPORT_STATUS.COMMITTING,
    this.buildAuditEvent(INTEGRASI_IMPORT_EVENT.COMMIT_STARTED, {
      previousStatus: batch.status,
      pendingValidRows,
    }),
  );

  if (!locked) {
    throw new ConflictException(
      'Batch sedang diproses oleh proses lain. Silakan muat ulang data',
    );
  }

  try {
    const rows = await this.repository.findValidRowsForCommit(batchId);

    const jabatanKeys = new Set<string>();
    const unorKeys = new Set<string>();
    const unorIndukKeys = new Set<string>();
    const pendidikanKeys = new Set<string>();

    const preparedRows = rows.map((row) => {
      const jabatanKey = this.extractFirstValue(row.mappedData, row.rawData, [
        'jabatanId',
        'jabatan_id',
        'JABATAN ID',
        'idJabatan',
        'id_jabatan',
        'jabatanSiasnId',
        'jabatan_siasn_id',
        'JABATAN_ID',
      ]);

      const unorKey = this.extractFirstValue(row.mappedData, row.rawData, [
        'unorId',
        'unor_id',
        'UNOR ID',
        'idUnor',
        'id_unor',
        'unorSiasnId',
        'unor_siasn_id',
        'UNOR_ID',
      ]);

      const unorIndukKey = this.extractFirstValue(row.mappedData, row.rawData, [
        'unorIndukId',
        'unor_induk_id',
        'UNOR INDUK ID',
        'idUnorInduk',
        'id_unor_induk',
        'UNOR_INDUK_ID',
      ]);

      const pendidikanKey = this.extractFirstValue(row.mappedData, row.rawData, [
        'pendidikanId',
        'pendidikan_id',
        'PENDIDIKAN ID',
        'idPendidikan',
        'id_pendidikan',
        'pendidikanSiasnId',
        'pendidikan_siasn_id',
        'PENDIDIKAN_ID',
      ]);

      if (jabatanKey) jabatanKeys.add(jabatanKey);
      if (unorKey) unorKeys.add(unorKey);
      if (unorIndukKey) unorIndukKeys.add(unorIndukKey);
      if (pendidikanKey) pendidikanKeys.add(pendidikanKey);

      return {
        row,
        jabatanKey,
        unorKey,
        unorIndukKey,
        pendidikanKey,
      };
    });

    const siasnIds = [
      ...new Set(
        preparedRows
          .map((item) => this.cleanOptionalString(item.row.siasnId))
          .filter((value): value is string => Boolean(value)),
      ),
    ];

    const [
      jabatanRefs,
      unorRefs,
      unorIndukRefs,
      pendidikanRefs,
      existingSiasnOwners,
    ] = await Promise.all([
      this.repository.findJabatanReferences([...jabatanKeys]),
      this.repository.findUnorReferences([...unorKeys]),
      this.repository.findUnorReferences([...unorIndukKeys]),
      this.repository.findPendidikanReferences([...pendidikanKeys]),
      this.repository.findExistingPegawaiBySiasnIds(siasnIds),
    ]);

    const jabatanMap = this.toReferenceMap(jabatanRefs);
    const unorMap = this.toReferenceMap(unorRefs);
    const unorIndukMap = this.toReferenceMap(unorIndukRefs);
    const pendidikanMap = this.toReferenceMap(pendidikanRefs);
    const existingSiasnOwnerMap =
      this.toExistingSiasnOwnerMap(existingSiasnOwners);

    const commitRows = preparedRows
      .map((item) => {
        const nip = item.row.nip?.trim();
        const nama = item.row.nama?.trim();
        const siasnId = this.cleanOptionalString(item.row.siasnId);

        if (!nip || !nama) {
          return null;
        }

        if (siasnId) {
          const ownerNip = existingSiasnOwnerMap.get(siasnId);

          if (ownerNip && ownerNip !== nip) {
            return null;
          }
        }

        const jabatan = item.jabatanKey ? jabatanMap.get(item.jabatanKey) : null;
        const unor = item.unorKey ? unorMap.get(item.unorKey) : null;
        const unorInduk = item.unorIndukKey
          ? unorIndukMap.get(item.unorIndukKey)
          : null;
        const pendidikan = item.pendidikanKey
          ? pendidikanMap.get(item.pendidikanKey)
          : null;

        const now = new Date();

        const create: Prisma.SilakapPegawaiUncheckedCreateInput = {
          nip,
          nama,
          nik: this.cleanOptionalString(item.row.nik),
          siasnId,
          jabatanId: jabatan?.id ?? null,
          jenisJabatanId: this.getReferenceJenisJabatanId(jabatan),
          unorId: unor?.id ?? null,
          unorIndukId: unorInduk?.id ?? null,
          pendidikanId: pendidikan?.id ?? null,
          pendidikanTingkatId: this.getReferenceTingkatId(pendidikan),
          rawSiasnJson: this.toInputJson(item.row.rawData),
          lastSyncedAt: now,
          syncSource: 'IMPORT_STAGING',
          statusAktif: true,
        };

        const update: Prisma.SilakapPegawaiUncheckedUpdateInput = {
          nama,
          ...this.optionalUpdate('nik', this.cleanOptionalString(item.row.nik)),
          ...this.optionalUpdate('siasnId', siasnId),
          ...this.optionalUpdate('jabatanId', jabatan?.id),
          ...this.optionalUpdate(
            'jenisJabatanId',
            this.getReferenceJenisJabatanId(jabatan),
          ),
          ...this.optionalUpdate('unorId', unor?.id),
          ...this.optionalUpdate('unorIndukId', unorInduk?.id),
          ...this.optionalUpdate('pendidikanId', pendidikan?.id),
          ...this.optionalUpdate(
            'pendidikanTingkatId',
            this.getReferenceTingkatId(pendidikan),
          ),
          rawSiasnJson: this.toInputJson(item.row.rawData),
          lastSyncedAt: now,
          syncSource: 'IMPORT_STAGING',
          deletedAt: null,
        };

        return {
          stagingId: item.row.id,
          create,
          update,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (commitRows.length === 0) {
      throw new ConflictException(
        'Tidak ada row yang dapat di-commit. Kemungkinan semua row konflik SIASN ID atau data wajib kosong',
      );
    }

    const result = await this.repository.commitPegawaiRows(batchId, commitRows);

    await this.repository.updateBatchStatus(
      batchId,
      INTEGRASI_IMPORT_STATUS.IMPORTED,
      this.buildAuditEvent(INTEGRASI_IMPORT_EVENT.COMMIT_SUCCESS, {
        importedRows: result.importedRows,
        skippedRows: rows.length - commitRows.length,
      }),
    );

    return {
      batchId: batchId.toString(),
      importedRows: result.importedRows,
      skippedRows: rows.length - commitRows.length,
      status: INTEGRASI_IMPORT_STATUS.IMPORTED,
    };
  } catch (error) {
    await this.repository.updateBatchStatus(
      batchId,
      INTEGRASI_IMPORT_STATUS.FAILED,
      this.buildAuditEvent(INTEGRASI_IMPORT_EVENT.COMMIT_FAILED, {
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    );

    throw error;
  }
}


async cancelBatch(batchId: bigint) {
  const batch = await this.repository.findBatchById(batchId);

  if (!batch) {
    throw new NotFoundException('Batch import tidak ditemukan');
  }

  if (batch.status === INTEGRASI_IMPORT_STATUS.CANCELLED) {
    return {
      batchId: batchId.toString(),
      status: INTEGRASI_IMPORT_STATUS.CANCELLED,
      message: 'Batch sudah dibatalkan sebelumnya',
    };
  }

  this.assertStatusAllowed(batch.status, CANCEL_ALLOWED_STATUSES, 'CANCEL');

  const cancelled = await this.repository.transitionBatchStatus(
    batchId,
    CANCEL_ALLOWED_STATUSES,
    INTEGRASI_IMPORT_STATUS.CANCELLED,
    this.buildAuditEvent(INTEGRASI_IMPORT_EVENT.CANCELLED, {
      previousStatus: batch.status,
    }),
  );

  if (!cancelled) {
    throw new ConflictException(
      'Batch tidak dapat dibatalkan karena status sudah berubah',
    );
  }

  return {
    batchId: batchId.toString(),
    status: INTEGRASI_IMPORT_STATUS.CANCELLED,
    message: 'Batch import berhasil dibatalkan',
  };
}

async uploadPegawaiImport(file: Express.Multer.File, userId?: string) {
    const rows = this.parseWorkbookToRows(file);

    if (rows.length === 0) {
      throw new BadRequestException('File import tidak memiliki data pegawai');
    }

    const batchCode = this.generateBatchCode();
    const created = await this.repository.createImportBatch({
      batchCode,
      fileName: file.originalname,
      totalRows: rows.length,
      status: INTEGRASI_IMPORT_STATUS.DRAFT,
      createdBy: userId || null,
      errors: this.buildAuditEvent('IMPORT_FILE_UPLOADED', {
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        totalRows: rows.length,
        uploadedBy: userId,
    }),
    rows: rows.map((row) => ({
      rowNumber: row.rowNumber,
      rawData: row.rawData,
      mappedData: row.mappedData,
      nip: row.nip,
      nik: row.nik,
      nama: row.nama,
      siasnId: row.siasnId,
      isValid: false,
      isImported: false,
    })),
  });

  return {
    batchId: created.id.toString(),
    batchCode: created.batchCode,
    fileName: created.fileName,
    totalRows: created.totalRows,
    validRows: created.validRows,
    invalidRows: created.invalidRows,
    importedRows: created.importedRows,
    status: created.status,
    createdAt: created.createdAt,
    message:
      'File berhasil diunggah ke staging. Lanjutkan proses validasi batch.',
  };
}

private parseWorkbookToRows(file: Express.Multer.File): ParsedImportRow[] {
  const workbook = XLSX.read(file.buffer, {
    type: 'buffer',
    cellDates: false,
    raw: false,
  });

  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new BadRequestException('File Excel tidak memiliki sheet');
  }

  const worksheet = workbook.Sheets[firstSheetName];

  if (!worksheet) {
    throw new BadRequestException('Sheet pertama tidak ditemukan');
  }

  const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: null,
    raw: false,
  });

  return records
    .map((record, index) => this.toParsedImportRow(record, index + 2))
    .filter((row): row is ParsedImportRow => row !== null);
}

private toParsedImportRow(
  record: Record<string, unknown>,
  rowNumber: number,
): ParsedImportRow | null {
  const normalizedRecord = this.normalizeRecord(record);

  if (Object.keys(normalizedRecord).length === 0) {
    return null;
  }

  const nip = this.extractFirstValue(normalizedRecord, normalizedRecord, [
    'nip',
    'NIP',
    'nipBaru',
    'nip_baru',
    'NIP BARU',
  ]);

  const nik = this.extractFirstValue(normalizedRecord, normalizedRecord, [
    'nik',
    'NIK',
  ]);

  const nama = this.extractFirstValue(normalizedRecord, normalizedRecord, [
    'nama',
    'NAMA',
    'namaPegawai',
    'nama_pegawai',
    'NAMA PEGAWAI',
  ]);

  const siasnId = this.extractFirstValue(normalizedRecord, normalizedRecord, [
    'siasnId',
    'siasn_id',
    'SIASN ID',
    'idSiasn',
    'id_siasn',
    'ID SIASN',
  ]);

  return {
    rowNumber,
    rawData: normalizedRecord,
    mappedData: {
      nip,
      nik,
      nama,
      siasnId,
      jabatanId: this.extractFirstValue(normalizedRecord, normalizedRecord, [
        'jabatanId',
        'jabatan_id',
        'JABATAN ID',
        'idJabatan',
        'id_jabatan',
        'jabatanSiasnId',
        'jabatan_siasn_id',
        'JABATAN_ID',
      ]),
      jabatanNama: this.extractFirstValue(normalizedRecord, normalizedRecord, [
        'jabatanNama',
        'jabatan_nama',
        'JABATAN NAMA',
        'namaJabatan',
        'nama_jabatan',
        'NAMA JABATAN',
        'jabatan',
        'JABATAN',
      ]),
      jenisJabatanId: this.extractFirstValue(normalizedRecord, normalizedRecord, [
        'JENIS JABATAN ID',
        'JENIS_JABATAN_ID',
        'jenisJabatanId',
        'jenis_jabatan_id',
      ]),
      jenisJabatanNama: this.extractFirstValue(normalizedRecord, normalizedRecord, [
        'JENIS JABATAN NAMA',
        'JENIS_JABATAN_NAMA',
        'jenisJabatanNama',
        'jenis_jabatan_nama',
      ]),
      unorId: this.extractFirstValue(normalizedRecord, normalizedRecord, [
        'unorId',
        'unor_id',
        'UNOR ID',
        'idUnor',
        'id_unor',
        'unorSiasnId',
        'unor_siasn_id',
        'UNOR_ID',
      ]),
      unorNama: this.extractFirstValue(normalizedRecord, normalizedRecord, [
        'unorNama',
        'unor_nama',
        'UNOR NAMA',
        'namaUnor',
        'nama_unor',
        'NAMA UNOR',
        'unitKerja',
        'unit_kerja',
        'UNIT KERJA',
      ]),
      unorIndukId: this.extractFirstValue(normalizedRecord, normalizedRecord, [
        'unorIndukId',
        'unor_induk_id',
        'UNOR INDUK ID',
        'idUnorInduk',
        'id_unor_induk',
        'UNOR_INDUK_ID',
      ]),
      pendidikanId: this.extractFirstValue(normalizedRecord, normalizedRecord, [
        'pendidikanId',
        'pendidikan_id',
        'PENDIDIKAN ID',
        'idPendidikan',
        'id_pendidikan',
        'pendidikanSiasnId',
        'pendidikan_siasn_id',
        'PENDIDIKAN_ID',
      ]),
      pendidikanNama: this.extractFirstValue(normalizedRecord, normalizedRecord, [
        'pendidikanNama',
        'pendidikan_nama',
        'PENDIDIKAN NAMA',
        'namaPendidikan',
        'nama_pendidikan',
        'NAMA PENDIDIKAN',
        'pendidikan',
        'PENDIDIKAN',
      ]),
      tingkatPendidikanId: this.extractFirstValue(normalizedRecord, normalizedRecord, [
        'TINGKAT PENDIDIKAN ID',
        'TINGKAT_PENDIDIKAN_ID',
        'tingkatPendidikanId',
        'tingkat_pendidikan_id',
      ]),
      tingkatPendidikanNama: this.extractFirstValue(normalizedRecord, normalizedRecord, [
        'TINGKAT PENDIDIKAN NAMA',
        'TINGKAT_PENDIDIKAN_NAMA',
        'tingkatPendidikanNama',
        'tingkat_pendidikan_nama',
      ]),
    },
    nip,
    nik,
    nama,
    siasnId,
  };
}

private normalizeRecord(record: Record<string, unknown>): Prisma.JsonObject {
  const normalized: Prisma.JsonObject = {};

  for (const [key, value] of Object.entries(record)) {
    const cleanKey = key.trim();

    if (cleanKey.length === 0) {
      continue;
    }

    if (value === null || value === undefined) {
      continue;
    }

    const rawValue =
      value instanceof Date ? value.toISOString() : String(value).trim();

    // Strip leading apostrophe — Excel uses ' prefix to force text format
    const cleanValue = rawValue.startsWith("'")
      ? rawValue.slice(1).trim()
      : rawValue;

    if (cleanValue.length === 0) {
      continue;
    }

    normalized[cleanKey] = cleanValue;
  }

  return normalized;
}

private generateBatchCode() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');

  return `PEG-${year}${month}${date}${hour}${minute}${second}`;
}

  private async buildMissingReferences(batchId: bigint) {
    const rows = await this.repository.findRowsForReferenceScan(batchId);

    const jabatanCandidates = this.collectReferenceCandidates(
      rows,
      [
        'jabatanId',
        'jabatan_id',
        'JABATAN ID',
        'idJabatan',
        'id_jabatan',
        'jabatanSiasnId',
        'jabatan_siasn_id',
        'JABATAN_ID',
      ],
      [
        'jabatanNama',
        'jabatan_nama',
        'JABATAN NAMA',
        'namaJabatan',
        'nama_jabatan',
        'NAMA JABATAN',
        'jabatan',
        'JABATAN',
      ],
    );

    const unorCandidates = this.collectReferenceCandidates(
      rows,
      [
        'unorId',
        'unor_id',
        'UNOR ID',
        'idUnor',
        'id_unor',
        'unorSiasnId',
        'unor_siasn_id',
        'UNOR_ID',
      ],
      [
        'unorNama',
        'unor_nama',
        'UNOR NAMA',
        'namaUnor',
        'nama_unor',
        'NAMA UNOR',
        'unitKerja',
        'unit_kerja',
        'UNIT KERJA',
      ],
    );

    const pendidikanCandidates = this.collectReferenceCandidates(
      rows,
      [
        'pendidikanId',
        'pendidikan_id',
        'PENDIDIKAN ID',
        'idPendidikan',
        'id_pendidikan',
        'pendidikanSiasnId',
        'pendidikan_siasn_id',
        'PENDIDIKAN_ID',
      ],
      [
        'pendidikanNama',
        'pendidikan_nama',
        'PENDIDIKAN NAMA',
        'namaPendidikan',
        'nama_pendidikan',
        'NAMA PENDIDIKAN',
        'pendidikan',
        'PENDIDIKAN',
      ],
    );

    const [existingJabatan, existingUnor, existingPendidikan] =
      await Promise.all([
        this.repository.findExistingJabatanKeys([...jabatanCandidates.keys()]),
        this.repository.findExistingUnorKeys([...unorCandidates.keys()]),
        this.repository.findExistingPendidikanKeys([
          ...pendidikanCandidates.keys(),
        ]),
      ]);

    return {
      jabatan: this.toMissingItems(
        jabatanCandidates,
        this.toExistingKeySet(existingJabatan),
      ),
      unor: this.toMissingItems(
        unorCandidates,
        this.toExistingKeySet(existingUnor),
      ),
      pendidikan: this.toMissingItems(
        pendidikanCandidates,
        this.toExistingKeySet(existingPendidikan),
      ),
    };
  }

  private async ensureBatchExists(batchId: bigint) {
    const batch = await this.repository.findBatchById(batchId);

    if (!batch) {
      throw new NotFoundException('Batch import tidak ditemukan');
    }
  }

  private collectReferenceCandidates(
    rows: {
      rowNumber: number;
      rawData: Prisma.JsonValue;
      mappedData: Prisma.JsonValue | null;
      errors: Prisma.JsonValue | null;
    }[],
    idKeys: string[],
    nameKeys: string[],
  ) {
    const result = new Map<string, ReferenceCandidate>();

    for (const row of rows) {
      const values = [
        ...this.extractValues(row.mappedData, idKeys),
        ...this.extractValues(row.rawData, idKeys),
      ];

      const name =
        this.extractFirstValue(row.mappedData, row.rawData, nameKeys) ?? null;

      for (const value of values) {
        const current = result.get(value) ?? {
          value,
          name,
          count: 0,
          sampleRows: [],
        };

        current.count += 1;

        if (!current.name && name) {
          current.name = name;
        }

        if (current.sampleRows.length < 5) {
          current.sampleRows.push(row.rowNumber);
        }

        result.set(value, current);
      }
    }

    return result;
  }

  private extractFirstValue(
    mappedData: Prisma.JsonValue | null,
    rawData: Prisma.JsonValue | null,
    keys: string[],
  ) {
    const values = [
      ...this.extractValues(mappedData, keys),
      ...this.extractValues(rawData, keys),
    ];

    return values[0] ?? null;
  }

  private extractValues(json: Prisma.JsonValue | null, keys: string[]) {
    if (!this.isJsonRecord(json)) {
      return [];
    }

    const values: string[] = [];

    for (const key of keys) {
      const value = this.findValueCaseInsensitive(json, key);

      if (typeof value === 'string' || typeof value === 'number') {
        const normalized = String(value).trim();

        if (normalized.length > 0) {
          values.push(normalized);
        }
      }
    }

    return [...new Set(values)];
  }

  private findValueCaseInsensitive(source: Prisma.JsonObject, key: string) {
    const normalizedKey = this.normalizeKey(key);

    for (const [sourceKey, value] of Object.entries(source)) {
      if (this.normalizeKey(sourceKey) === normalizedKey) {
        return value;
      }
    }

    return undefined;
  }

  private normalizeKey(value: string) {
    return value.replace(/[\s_-]/g, '').toLowerCase();
  }

  private isJsonRecord(
    value: Prisma.JsonValue | null,
  ): value is Prisma.JsonObject {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  private toExistingKeySet(
    records: {
      idSiasn?: string | null;
      kode?: string | null;
    }[],
  ) {
    const set = new Set<string>();

    for (const record of records) {
      if (record.idSiasn) set.add(record.idSiasn);
      if (record.kode) set.add(record.kode);
    }

    return set;
  }

  private toMissingItems(
    candidates: Map<string, ReferenceCandidate>,
    existingKeys: Set<string>,
  ): MissingReferenceItem[] {
    return [...candidates.values()]
      .filter((item) => !existingKeys.has(item.value))
      .map((item) => ({
        value: item.value,
        name: item.name,
        count: item.count,
        sampleRows: item.sampleRows,
      }))
      .sort((a, b) => b.count - a.count);
  }

  private cleanOptionalString(value: string | null | undefined) {
    const normalized = value?.trim();

    return normalized && normalized.length > 0 ? normalized : null;
  }

  private optionalUpdate<TValue>(
    key: keyof Prisma.SilakapPegawaiUncheckedUpdateInput,
    value: TValue | null | undefined,
  ): Partial<Prisma.SilakapPegawaiUncheckedUpdateInput> {
    if (value === null || value === undefined) {
      return {};
    }

    return {
      [key]: value,
    };
  }

  private toReferenceMap<
    TReference extends {
      id: bigint;
      idSiasn?: string | null;
      kode?: string | null;
    },
  >(records: TReference[]) {
    const map = new Map<string, TReference>();

    for (const record of records) {
      if (record.idSiasn) {
        map.set(record.idSiasn, record);
      }

      if (record.kode) {
        map.set(record.kode, record);
      }
    }

    return map;
  }

  private getReferenceJenisJabatanId(
    value:
      | {
          jenisJabatanId?: bigint | null;
        }
      | null
      | undefined,
  ) {
    return value?.jenisJabatanId ?? null;
  }

  private getReferenceTingkatId(
    value:
      | {
          tingkatId?: bigint | null;
        }
      | null
      | undefined,
  ) {
    return value?.tingkatId ?? null;
  }

  private toInputJson(
    value: Prisma.JsonValue | null | undefined,
  ): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
    if (value === null || value === undefined) {
      return Prisma.JsonNull;
    }

    return value as Prisma.InputJsonValue;
  }

  private toExistingSiasnOwnerMap(
    records: {
      id: bigint;
      nip: string;
      siasnId: string | null;
    }[],
  ) {
    const map = new Map<string, string>();

    for (const record of records) {
      if (record.siasnId) {
        map.set(record.siasnId, record.nip);
      }
    }

    return map;
  }

  private assertStatusAllowed(
    currentStatus: string,
    allowedStatuses: readonly IntegrasiImportStatus[],
    actionLabel: string,
  ) {
    if (!allowedStatuses.includes(currentStatus as IntegrasiImportStatus)) {
      throw new BadRequestException(
        `Batch dengan status ${currentStatus} tidak dapat diproses untuk aksi ${actionLabel}`,
      );
    }
  }

  private buildAuditEvent(
    event: string,
    payload: Record<string, unknown> = {},
  ): Prisma.InputJsonValue {
    return {
      event,
      ...payload,
      at: new Date().toISOString(),
    };
  }  

private toSafeJsonObject(value: unknown): Prisma.JsonObject {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const result: Prisma.JsonObject = {};

  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (
      item === undefined ||
      item === Prisma.DbNull ||
      item === Prisma.JsonNull ||
      item === Prisma.AnyNull
    ) {
      continue;
    }

    if (
      item === null ||
      typeof item === 'string' ||
      typeof item === 'number' ||
      typeof item === 'boolean'
    ) {
      result[key] = item;
      continue;
    }

    if (item instanceof Date) {
      result[key] = item.toISOString();
      continue;
    }

    if (Array.isArray(item)) {
      result[key] = item
        .filter(
          (entry) =>
            entry !== undefined &&
            entry !== Prisma.DbNull &&
            entry !== Prisma.JsonNull &&
            entry !== Prisma.AnyNull,
        )
        .map((entry) =>
          entry instanceof Date ? entry.toISOString() : String(entry),
        );
      continue;
    }

    if (typeof item === 'object') {
      result[key] = this.toSafeJsonObject(item);
    }
  }

  return result;
}

}