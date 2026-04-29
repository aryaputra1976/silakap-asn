import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { INTEGRASI_IMPORT_STATUS } from '../import/integrasi-import-status.constant';
import { PrismaService } from '../../../prisma/prisma.service';
import type {
  QueryIntegrasiLogRowsDto,
  QueryIntegrasiLogsDto,
} from './dto/query-integrasi-logs.dto';

@Injectable()
export class IntegrasiLogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findLogs(query: QueryIntegrasiLogsDto) {
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
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.silakapPegawaiImportBatch.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findLogsForExport(query: QueryIntegrasiLogsDto) {
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

    return this.prisma.silakapPegawaiImportBatch.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findLogById(id: bigint) {
    return this.prisma.silakapPegawaiImportBatch.findUnique({
      where: { id },
    });
  }

  async existsLogById(id: bigint) {
    const count = await this.prisma.silakapPegawaiImportBatch.count({
      where: { id },
    });

    return count > 0;
  }

  async findLogRows(batchId: bigint, query: QueryIntegrasiLogRowsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = (page - 1) * limit;

    const rowStatus = query.rowStatus ?? 'ALL';

    const where: Prisma.SilakapPegawaiImportStagingWhereInput = {
      batchId,
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
      ...(rowStatus === 'ERROR'
        ? {
            OR: [{ isValid: false }, { errors: { not: Prisma.JsonNull } }],
          }
        : {}),
      ...(rowStatus === 'IMPORTED' ? { isImported: true } : {}),
      ...(rowStatus === 'VALID' ? { isValid: true } : {}),
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

  async getSummary() {
    const [
      totalBatches,
      draftBatches,
      validatingBatches,
      validatedBatches,
      errorBatches,
      committingBatches,
      importedBatches,
      failedBatches,
      cancelledBatches,
      totalRows,
      validRows,
      invalidRows,
      importedRows,
    ] = await this.prisma.$transaction([
      this.prisma.silakapPegawaiImportBatch.count(),
      this.prisma.silakapPegawaiImportBatch.count({
        where: { status: INTEGRASI_IMPORT_STATUS.DRAFT },
      }),
      this.prisma.silakapPegawaiImportBatch.count({
        where: { status: INTEGRASI_IMPORT_STATUS.VALIDATING },
      }),
      this.prisma.silakapPegawaiImportBatch.count({
        where: { status: INTEGRASI_IMPORT_STATUS.VALIDATED },
      }),
      this.prisma.silakapPegawaiImportBatch.count({
        where: { status: INTEGRASI_IMPORT_STATUS.VALIDATED_WITH_ERROR },
      }),
      this.prisma.silakapPegawaiImportBatch.count({
        where: { status: INTEGRASI_IMPORT_STATUS.COMMITTING },
      }),
      this.prisma.silakapPegawaiImportBatch.count({
        where: { status: INTEGRASI_IMPORT_STATUS.IMPORTED },
      }),
      this.prisma.silakapPegawaiImportBatch.count({
        where: { status: INTEGRASI_IMPORT_STATUS.FAILED },
      }),
      this.prisma.silakapPegawaiImportBatch.count({
        where: { status: INTEGRASI_IMPORT_STATUS.CANCELLED },
      }),
      this.prisma.silakapPegawaiImportBatch.aggregate({
        _sum: { totalRows: true },
      }),
      this.prisma.silakapPegawaiImportBatch.aggregate({
        _sum: { validRows: true },
      }),
      this.prisma.silakapPegawaiImportBatch.aggregate({
        _sum: { invalidRows: true },
      }),
      this.prisma.silakapPegawaiImportBatch.aggregate({
        _sum: { importedRows: true },
      }),
    ]);

    return {
      totalBatches,
      draftBatches,
      validatingBatches,
      validatedBatches,
      errorBatches,
      committingBatches,
      importedBatches,
      failedBatches,
      cancelledBatches,
      totalRows: totalRows._sum.totalRows ?? 0,
      validRows: validRows._sum.validRows ?? 0,
      invalidRows: invalidRows._sum.invalidRows ?? 0,
      importedRows: importedRows._sum.importedRows ?? 0,
    };
  }
}
