import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

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
      failedImportBatches,
      importedBatches,
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
      this.prisma.silakapPegawaiImportBatch.count({
        where: { status: 'VALIDATED_WITH_ERROR' },
      }),
      this.prisma.silakapPegawaiImportBatch.count({
        where: { status: 'IMPORTED' },
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
      failedImportBatches,
      importedBatches,
    };
  }
}