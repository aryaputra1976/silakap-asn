import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { INTEGRASI_IMPORT_STATUS } from '../import/integrasi-import-status.constant';

@Injectable()
export class IntegrasiSiasnRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [
      totalPegawai,
      pegawaiWithSiasnId,
      pegawaiWithoutSiasnId,
      activePegawai,
      inactivePegawai,
      latestSyncedPegawai,
      latestImportBatch,
      totalBatches,
      draftBatches,
      validatingBatches,
      validatedBatches,
      validatedWithErrorBatches,
      committingBatches,
      importedBatches,
      failedBatches,
      cancelledBatches,
      totalRows,
      validRows,
      invalidRows,
      importedRows,
    ] = await this.prisma.$transaction([
      this.prisma.silakapPegawai.count({
        where: { deletedAt: null },
      }),
      this.prisma.silakapPegawai.count({
        where: {
          deletedAt: null,
          siasnId: { not: null },
        },
      }),
      this.prisma.silakapPegawai.count({
        where: {
          deletedAt: null,
          siasnId: null,
        },
      }),
      this.prisma.silakapPegawai.count({
        where: {
          deletedAt: null,
          statusAktif: true,
        },
      }),
      this.prisma.silakapPegawai.count({
        where: {
          deletedAt: null,
          statusAktif: false,
        },
      }),
      this.prisma.silakapPegawai.findFirst({
        where: {
          deletedAt: null,
          lastSyncedAt: { not: null },
        },
        orderBy: { lastSyncedAt: 'desc' },
        select: {
          id: true,
          nip: true,
          nama: true,
          siasnId: true,
          lastSyncedAt: true,
          syncSource: true,
        },
      }),
      this.prisma.silakapPegawaiImportBatch.findFirst({
        orderBy: { updatedAt: 'desc' },
      }),
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
      totalPegawai,
      pegawaiWithSiasnId,
      pegawaiWithoutSiasnId,
      activePegawai,
      inactivePegawai,
      latestSyncedPegawai,
      latestImportBatch,
      totalBatches,
      draftBatches,
      validatingBatches,
      validatedBatches,
      validatedWithErrorBatches,
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