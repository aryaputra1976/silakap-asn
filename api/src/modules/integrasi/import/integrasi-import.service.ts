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
      const created = await this.repository.createJabatanReferences(
        candidates.map((item) => ({
          idSiasn: item.value,
          kode: item.value,
          nama: item.name as string,
          jenisJabatanId: null,
          eselonId: null,
          jenjang: null,
          bup: null,
          unorNama: null,
        })),
      );

      return {
        batchId: batchId.toString(),
        referenceType,
        created,
        skipped: references[referenceType].length - candidates.length,
      };
    }

    if (referenceType === 'unor') {
      const created = await this.repository.createUnorReferences(
        candidates.map((item) => ({
          idSiasn: item.value,
          kode: item.value,
          nama: item.name as string,
          parentId: null,
          level: null,
          formasiIdeal: null,
          kecamatanId: null,
          sortOrder: null,
        })),
      );

      return {
        batchId: batchId.toString(),
        referenceType,
        created,
        skipped: references[referenceType].length - candidates.length,
      };
    }

    const created = await this.repository.createPendidikanReferences(
      candidates.map((item) => ({
        idSiasn: item.value,
        kode: item.value,
        nama: item.name as string,
        tingkatId: null,
      })),
    );

    return {
      batchId: batchId.toString(),
      referenceType,
      created,
      skipped: references[referenceType].length - candidates.length,
    };
  }

  async validateBatch(batchId: bigint) {
    await this.ensureBatchExists(batchId);

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

    const status = invalidRows > 0 ? 'VALIDATED_WITH_ERROR' : 'VALIDATED';

    await this.repository.updateValidationResult(batchId, validationRows, {
      validRows,
      invalidRows,
      status,
      errors:
        invalidRows > 0
          ? {
              totalRows: rows.length,
              validRows,
              invalidRows,
            }
          : Prisma.JsonNull,
    });

    return {
      batchId: batchId.toString(),
      totalRows: rows.length,
      validRows,
      invalidRows,
      status,
    };
  }

  async commitBatch(batchId: bigint) {
    const batch = await this.repository.findBatchById(batchId);

    if (!batch) {
      throw new NotFoundException('Batch import tidak ditemukan');
    }

    if (batch.status === 'IMPORTED') {
      throw new ConflictException('Batch ini sudah pernah diimport');
    }

    if (batch.status !== 'VALIDATED') {
      throw new BadRequestException(
        'Batch hanya boleh di-commit jika status VALIDATED tanpa error',
      );
    }

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

    const pendingValidRows =
      await this.repository.countPendingValidRows(batchId);

    if (pendingValidRows === 0) {
      throw new BadRequestException('Tidak ada data valid yang perlu diimport');
    }

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

    return {
      batchId: batchId.toString(),
      importedRows: result.importedRows,
      skippedRows: rows.length - commitRows.length,
      status: 'IMPORTED',
    };
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
}