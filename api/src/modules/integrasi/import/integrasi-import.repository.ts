import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import type {
  QueryImportBatchDto,
  QueryImportErrorsDto,
} from './dto/query-import-batch.dto';

@Injectable()
export class IntegrasiImportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBatches(query: QueryImportBatchDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.SilakapPegawaiImportBatchWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? {
            OR: [
              { batchCode: { contains: query.q } },
              { fileName: { contains: query.q } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.silakapPegawaiImportBatch.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.silakapPegawaiImportBatch.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findBatchById(batchId: bigint) {
    return this.prisma.silakapPegawaiImportBatch.findUnique({
      where: { id: batchId },
    });
  }

  async findStagingRowById(rowId: bigint) {
    return this.prisma.silakapPegawaiImportStaging.findUnique({
      where: { id: rowId },
      include: {
        batch: true,
      },
    });
  }

  async findErrorRows(batchId: bigint, query: QueryImportErrorsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.SilakapPegawaiImportStagingWhereInput = {
      batchId,
      isValid: false,
      ...(query.q
        ? {
            OR: [
              { nip: { contains: query.q } },
              { nik: { contains: query.q } },
              { nama: { contains: query.q } },
              { siasnId: { contains: query.q } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.silakapPegawaiImportStaging.findMany({
        where,
        orderBy: { rowNumber: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.silakapPegawaiImportStaging.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findRowsForReferenceScan(batchId: bigint) {
    return this.prisma.silakapPegawaiImportStaging.findMany({
      where: { batchId },
      select: {
        rowNumber: true,
        rawData: true,
        mappedData: true,
        errors: true,
      },
      orderBy: { rowNumber: 'asc' },
    });
  }

  async findRowsForValidation(batchId: bigint) {
    return this.prisma.silakapPegawaiImportStaging.findMany({
      where: { batchId },
      orderBy: { rowNumber: 'asc' },
    });
  }

  async updateValidationResult(
    batchId: bigint,
    rows: {
      id: bigint;
      isValid: boolean;
      errors: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
    }[],
    summary: {
      validRows: number;
      invalidRows: number;
      status: string;
      errors: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
    },
  ) {
    await this.prisma.$transaction([
      ...rows.map((row) =>
        this.prisma.silakapPegawaiImportStaging.update({
          where: { id: row.id },
          data: {
            isValid: row.isValid,
            errors: row.errors,
          },
        }),
      ),
      this.prisma.silakapPegawaiImportBatch.update({
        where: { id: batchId },
        data: {
          validRows: summary.validRows,
          invalidRows: summary.invalidRows,
          status: summary.status,
          errors: summary.errors,
        },
      }),
    ]);
  }

  async updateImportRowAndResetBatch(
    rowId: bigint,
    batchId: bigint,
    payload: {
      nip: string | null;
      nik: string | null;
      nama: string | null;
      siasnId: string | null;
      rawData: Prisma.InputJsonValue;
      mappedData: Prisma.InputJsonValue;
    },
    audit: Prisma.InputJsonValue,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updatedRow = await tx.silakapPegawaiImportStaging.update({
        where: { id: rowId },
        data: {
          nip: payload.nip,
          nik: payload.nik,
          nama: payload.nama,
          siasnId: payload.siasnId,
          rawData: payload.rawData,
          mappedData: payload.mappedData,
          errors: Prisma.JsonNull,
          isValid: false,
        },
      });

      const invalidRows = await tx.silakapPegawaiImportStaging.count({
        where: {
          batchId,
          isValid: false,
        },
      });

      await tx.silakapPegawaiImportBatch.update({
        where: { id: batchId },
        data: {
          validRows: 0,
          invalidRows,
          status: 'DRAFT',
          errors: audit,
        },
      });

      return updatedRow;
    });
  }

  async findExistingJabatanKeys(values: string[]) {
    if (values.length === 0) return [];

    return this.prisma.refJabatan.findMany({
      where: {
        deletedAt: null,
        OR: [{ idSiasn: { in: values } }, { kode: { in: values } }],
      },
      select: {
        idSiasn: true,
        kode: true,
      },
    });
  }

  async findExistingUnorKeys(values: string[]) {
    if (values.length === 0) return [];

    return this.prisma.refUnor.findMany({
      where: {
        deletedAt: null,
        OR: [{ idSiasn: { in: values } }, { kode: { in: values } }],
      },
      select: {
        idSiasn: true,
        kode: true,
      },
    });
  }

  async findExistingPendidikanKeys(values: string[]) {
    if (values.length === 0) return [];

    return this.prisma.refPendidikan.findMany({
      where: {
        deletedAt: null,
        OR: [{ idSiasn: { in: values } }, { kode: { in: values } }],
      },
      select: {
        idSiasn: true,
        kode: true,
      },
    });
  }

  async createJabatanReferences(
    items: {
      idSiasn: string;
      nama: string;
      jenisJabatanSiasnId: string | null;
      jenisJabatanNama: string | null;
    }[],
  ) {
    if (items.length === 0) return 0;

    let created = 0;

    await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const existing = await tx.refJabatan.findFirst({
          where: { idSiasn: item.idSiasn },
          select: { id: true },
        });

        if (existing) continue;

        const prefix = this.deriveJabatanKodePrefix(item.jenisJabatanNama);
        const kode = await this.generateNextJabatanKode(tx, prefix);
        const jenisJabatanId = this.deriveJenisJabatanId(item.jenisJabatanNama);

        await tx.refJabatan.create({
          data: {
            idSiasn: item.idSiasn,
            kode,
            nama: item.nama,
            jenisJabatanId,
            eselonId: null,
            jenjang: null,
            bup: null,
            unorNama: null,
            isActive: true,
          },
        });

        created++;
      }
    });

    return created;
  }

  private deriveJabatanKodePrefix(jenisNama: string | null): string {
    if (!jenisNama) return 'JAB';
    const lower = jenisNama.toLowerCase();
    if (lower.includes('struktural')) return 'STR';
    if (lower.includes('fungsional')) return 'FUNG';
    if (lower.includes('pelaksana')) return 'PLK';
    return 'JAB';
  }

  private deriveJenisJabatanId(jenisNama: string | null): bigint | null {
    if (!jenisNama) return null;
    const lower = jenisNama.toLowerCase();
    if (lower.includes('struktural')) return BigInt(1);
    if (lower.includes('fungsional')) return BigInt(2);
    if (lower.includes('pelaksana')) return BigInt(3);
    return null;
  }

  private async generateNextJabatanKode(
    tx: Prisma.TransactionClient,
    prefix: string,
  ) {
    const last = await tx.refJabatan.findFirst({
      where: { kode: { startsWith: `${prefix}-` } },
      orderBy: { id: 'desc' },
      select: { kode: true },
    });

    const lastNumber = last?.kode
      ? Number(last.kode.replace(`${prefix}-`, ''))
      : 0;
    const nextNumber = Number.isFinite(lastNumber) ? lastNumber + 1 : 1;

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }

  async createUnorReferences(
    items: {
      idSiasn: string;
      nama: string;
    }[],
  ) {
    if (items.length === 0) return 0;

    let created = 0;

    await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const existing = await tx.refUnor.findFirst({
          where: { idSiasn: item.idSiasn },
          select: { id: true },
        });

        if (existing) continue;

        const kode = await this.generateNextUnorKode(tx);

        await tx.refUnor.create({
          data: {
            idSiasn: item.idSiasn,
            kode,
            nama: item.nama || '(belum diisi)',
            parentId: null,
            level: null,
            formasiIdeal: null,
            kecamatanId: null,
            sortOrder: null,
            isActive: true,
          },
        });

        created++;
      }
    });

    return created;
  }

  private async generateNextUnorKode(tx: Prisma.TransactionClient) {
    const last = await tx.refUnor.findFirst({
      where: { kode: { startsWith: 'UNOR-' } },
      orderBy: { id: 'desc' },
      select: { kode: true },
    });

    const lastNumber = last?.kode ? Number(last.kode.replace('UNOR-', '')) : 0;
    const nextNumber = Number.isFinite(lastNumber) ? lastNumber + 1 : 1;

    return `UNOR-${String(nextNumber).padStart(4, '0')}`;
  }

  async createPendidikanReferences(
    items: {
      idSiasn: string
      nama: string
      tingkatSiasnId: string | null
      tingkatNama: string | null
    }[],
  ) {
    if (items.length === 0) return 0

    let created = 0

    await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const existing = await tx.refPendidikan.findFirst({
          where: { idSiasn: item.idSiasn },
          select: { id: true },
        })

        if (existing) continue

        let tingkatId: bigint | null = null

        if (item.tingkatSiasnId) {
          let tingkat = await tx.refPendidikanTingkat.findFirst({
            where: { idSiasn: item.tingkatSiasnId },
            select: { id: true },
          })

          if (!tingkat && item.tingkatNama) {
            tingkat = await tx.refPendidikanTingkat.create({
              data: {
                kode: item.tingkatSiasnId,
                nama: item.tingkatNama,
                idSiasn: item.tingkatSiasnId,
                isActive: true,
              },
              select: { id: true },
            })
          }

          tingkatId = tingkat?.id ?? null
        }

        const kode = await this.generateNextPendidikanKode(tx)

        await tx.refPendidikan.create({
          data: {
            idSiasn: item.idSiasn,
            kode,
            nama: item.nama,
            tingkatId,
            isActive: true,
          },
        })

        created += 1
      }
    })

    return created
  }

  private async generateNextPendidikanKode(tx: Prisma.TransactionClient) {
    const last = await tx.refPendidikan.findFirst({
      where: { kode: { startsWith: 'PD-' } },
      orderBy: { id: 'desc' },
      select: { kode: true },
    })

    const lastNumber = last?.kode ? Number(last.kode.replace('PD-', '')) : 0
    const nextNumber = Number.isFinite(lastNumber) ? lastNumber + 1 : 1

    return `PD-${String(nextNumber).padStart(4, '0')}`
  }

  async findValidRowsForCommit(batchId: bigint) {
    return this.prisma.silakapPegawaiImportStaging.findMany({
      where: {
        batchId,
        isValid: true,
        isImported: false,
      },
      orderBy: { rowNumber: 'asc' },
    });
  }

  async findJabatanReferences(values: string[]) {
    if (values.length === 0) return [];

    return this.prisma.refJabatan.findMany({
      where: {
        deletedAt: null,
        OR: [{ idSiasn: { in: values } }, { kode: { in: values } }],
      },
      select: {
        id: true,
        idSiasn: true,
        kode: true,
        jenisJabatanId: true,
      },
    });
  }

  async findUnorReferences(values: string[]) {
    if (values.length === 0) return [];

    return this.prisma.refUnor.findMany({
      where: {
        deletedAt: null,
        OR: [{ idSiasn: { in: values } }, { kode: { in: values } }],
      },
      select: {
        id: true,
        idSiasn: true,
        kode: true,
      },
    });
  }

  async findPendidikanReferences(values: string[]) {
    if (values.length === 0) return [];

    return this.prisma.refPendidikan.findMany({
      where: {
        deletedAt: null,
        OR: [{ idSiasn: { in: values } }, { kode: { in: values } }],
      },
      select: {
        id: true,
        idSiasn: true,
        kode: true,
        tingkatId: true,
      },
    });
  }

  async commitPegawaiRows(
    batchId: bigint,
    rows: {
      stagingId: bigint;
      create: Prisma.SilakapPegawaiUncheckedCreateInput;
      update: Prisma.SilakapPegawaiUncheckedUpdateInput;
    }[],
  ) {
    if (rows.length === 0) {
      return {
        importedRows: 0,
      };
    }

    await this.prisma.$transaction(
      async (tx) => {
        const batch = await tx.silakapPegawaiImportBatch.findUnique({
          where: { id: batchId },
          select: { id: true, status: true },
        });

        if (!batch || batch.status !== 'COMMITTING') {
          throw new Error(
            'Batch tidak berada pada status COMMITTING. Commit dibatalkan',
          );
        }

        for (const row of rows) {
          await tx.silakapPegawai.upsert({
            where: { nip: row.create.nip },
            create: row.create,
            update: row.update,
          });

          await tx.silakapPegawaiImportStaging.update({
            where: {
              id: row.stagingId,
            },
            data: {
              isImported: true,
            },
          });
        }

        const importedRows = await tx.silakapPegawaiImportStaging.count({
          where: {
            batchId,
            isImported: true,
          },
        });

        await tx.silakapPegawaiImportBatch.update({
          where: { id: batchId },
          data: {
            importedRows,
          },
        });
      },
      {
        timeout: 60_000,
        maxWait: 10_000,
      },
    );

    return {
      importedRows: rows.length,
    };
  }

  async countInvalidRows(batchId: bigint) {
    return this.prisma.silakapPegawaiImportStaging.count({
      where: {
        batchId,
        isValid: false,
      },
    });
  }

  async countPendingValidRows(batchId: bigint) {
    return this.prisma.silakapPegawaiImportStaging.count({
      where: {
        batchId,
        isValid: true,
        isImported: false,
      },
    });
  }

  async findExistingPegawaiBySiasnIds(siasnIds: string[]) {
    if (siasnIds.length === 0) return [];

    return this.prisma.silakapPegawai.findMany({
      where: {
        deletedAt: null,
        siasnId: { in: siasnIds },
      },
      select: {
        id: true,
        nip: true,
        siasnId: true,
      },
    });
  }

  async cancelBatch(batchId: bigint, audit: Prisma.InputJsonValue) {
    return this.prisma.silakapPegawaiImportBatch.update({
      where: { id: batchId },
      data: {
        status: 'CANCELLED',
        errors: audit,
      },
    });
  }

  async transitionBatchStatus(
    batchId: bigint,
    fromStatuses: readonly string[],
    toStatus: string,
    audit: Prisma.InputJsonValue,
  ) {
    const result = await this.prisma.silakapPegawaiImportBatch.updateMany({
      where: {
        id: batchId,
        status: { in: [...fromStatuses] },
      },
      data: {
        status: toStatus,
        errors: audit,
      },
    });

    return result.count === 1;
  }

  async updateBatchStatus(
    batchId: bigint,
    status: string,
    audit: Prisma.InputJsonValue,
  ) {
    return this.prisma.silakapPegawaiImportBatch.update({
      where: { id: batchId },
      data: {
        status,
        errors: audit,
      },
    });
  }

  async createImportBatch(payload: {
    batchCode: string;
    fileName: string;
    totalRows: number;
    status: string;
    createdBy?: string | null;
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
  }) {
    return this.prisma.$transaction(
      async (tx) => {
        const batch = await tx.silakapPegawaiImportBatch.create({
          data: {
            batchCode: payload.batchCode,
            fileName: payload.fileName,
            totalRows: payload.totalRows,
            validRows: 0,
            invalidRows: 0,
            importedRows: 0,
            status: payload.status,
            createdBy: payload.createdBy || null,
            errors: payload.errors,
          },
        });

        await tx.silakapPegawaiImportStaging.createMany({
          data: payload.rows.map((row) => ({
            batchId: batch.id,
            rowNumber: row.rowNumber,
            nip: row.nip,
            nik: row.nik,
            nama: row.nama,
            siasnId: row.siasnId,
            rawData: row.rawData,
            mappedData: row.mappedData,
            errors: Prisma.JsonNull,
            isValid: row.isValid,
            isImported: row.isImported,
          })),
        });

        return batch;
      },
      {
        timeout: 60_000,
        maxWait: 10_000,
      },
    );
  }
}