import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { INTEGRASI_IMPORT_STATUS } from '../import/integrasi-import-status.constant';
import type { QueryIntegrasiJobsDto } from './dto/query-integrasi-jobs.dto';

@Injectable()
export class IntegrasiJobsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findJobs(query: QueryIntegrasiJobsDto) {
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

  async findJobByBatchId(batchId: bigint) {
    return this.prisma.silakapPegawaiImportBatch.findUnique({
      where: { id: batchId },
    });
  }

  async getSummary() {
    const [
      totalJobs,
      draftJobs,
      validatingJobs,
      validatedJobs,
      errorJobs,
      committingJobs,
      importedJobs,
      failedJobs,
      cancelledJobs,
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
      totalJobs,
      draftJobs,
      validatingJobs,
      validatedJobs,
      errorJobs,
      committingJobs,
      importedJobs,
      failedJobs,
      cancelledJobs,
      totalRows: totalRows._sum.totalRows ?? 0,
      validRows: validRows._sum.validRows ?? 0,
      invalidRows: invalidRows._sum.invalidRows ?? 0,
      importedRows: importedRows._sum.importedRows ?? 0,
    };
  }
}