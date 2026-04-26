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
      kode: string;
      nama: string;
      jenisJabatanId: bigint | null;
      eselonId: string | null;
      jenjang: string | null;
      bup: number | null;
      unorNama: string | null;
    }[],
  ) {
    if (items.length === 0) return 0;

    const result = await this.prisma.refJabatan.createMany({
      data: items,
      skipDuplicates: true,
    });

    return result.count;
  }

  async createUnorReferences(
    items: {
      idSiasn: string;
      kode: string;
      nama: string;
      parentId: bigint | null;
      level: number | null;
      formasiIdeal: number | null;
      kecamatanId: bigint | null;
      sortOrder: number | null;
    }[],
  ) {
    if (items.length === 0) return 0;

    const result = await this.prisma.refUnor.createMany({
      data: items,
      skipDuplicates: true,
    });

    return result.count;
  }

  async createPendidikanReferences(
    items: {
      idSiasn: string;
      kode: string;
      nama: string;
      tingkatId: bigint | null;
    }[],
  ) {
    if (items.length === 0) return 0;

    const result = await this.prisma.refPendidikan.createMany({
      data: items,
      skipDuplicates: true,
    });

    return result.count;
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