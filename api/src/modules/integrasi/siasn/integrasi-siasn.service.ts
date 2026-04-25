import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { IntegrasiSiasnRepository } from './integrasi-siasn.repository';

type LatestSyncedPegawai = {
  id: bigint;
  nip: string;
  nama: string;
  siasnId: string | null;
  lastSyncedAt: Date | null;
  syncSource: string | null;
} | null;

type LatestImportBatch = {
  id: bigint;
  batchCode: string;
  fileName: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  importedRows: number;
  status: string;
  errors: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
} | null;

type SiasnSummaryRaw = {
  totalPegawai: number;
  pegawaiWithSiasnId: number;
  pegawaiWithoutSiasnId: number;
  activePegawai: number;
  inactivePegawai: number;
  latestSyncedPegawai: LatestSyncedPegawai;
  latestImportBatch: LatestImportBatch;
  failedImportBatches: number;
  importedBatches: number;
};

@Injectable()
export class IntegrasiSiasnService {
  constructor(private readonly repository: IntegrasiSiasnRepository) {}

  async getSummary() {
    const data = await this.repository.getSummary();

    return {
      pegawai: {
        total: data.totalPegawai,
        active: data.activePegawai,
        inactive: data.inactivePegawai,
        withSiasnId: data.pegawaiWithSiasnId,
        withoutSiasnId: data.pegawaiWithoutSiasnId,
        siasnCoveragePercent: this.calculatePercent(
          data.pegawaiWithSiasnId,
          data.totalPegawai,
        ),
      },
      sync: {
        status: this.getHealthStatus(data),
        latestSyncedPegawai: this.toLatestSyncedPegawai(
          data.latestSyncedPegawai,
        ),
        latestImportBatch: this.toLatestImportBatch(data.latestImportBatch),
        failedImportBatches: data.failedImportBatches,
        importedBatches: data.importedBatches,
      },
    };
  }

  async getStatus() {
    const data = await this.repository.getSummary();

    return {
      status: this.getHealthStatus(data),
      message: this.getHealthMessage(data),
      checkedAt: new Date(),
    };
  }

  private calculatePercent(value: number, total: number) {
    if (total <= 0) {
      return 0;
    }

    return Number(((value / total) * 100).toFixed(2));
  }

  private getHealthStatus(data: SiasnSummaryRaw) {
    if (data.failedImportBatches > 0) {
      return 'WARNING';
    }

    if (data.pegawaiWithoutSiasnId > 0) {
      return 'PARTIAL';
    }

    return 'HEALTHY';
  }

  private getHealthMessage(data: SiasnSummaryRaw) {
    if (data.failedImportBatches > 0) {
      return 'Terdapat batch import yang masih memiliki error validasi';
    }

    if (data.pegawaiWithoutSiasnId > 0) {
      return 'Sebagian pegawai belum memiliki SIASN ID';
    }

    return 'Integrasi SIASN dalam kondisi baik';
  }

  private toLatestSyncedPegawai(value: LatestSyncedPegawai) {
    if (!value) {
      return null;
    }

    return {
      id: value.id.toString(),
      nip: value.nip,
      nama: value.nama,
      siasnId: value.siasnId,
      lastSyncedAt: value.lastSyncedAt,
      syncSource: value.syncSource,
    };
  }

  private toLatestImportBatch(value: LatestImportBatch) {
    if (!value) {
      return null;
    }

    return {
      id: value.id.toString(),
      batchCode: value.batchCode,
      fileName: value.fileName,
      totalRows: value.totalRows,
      validRows: value.validRows,
      invalidRows: value.invalidRows,
      importedRows: value.importedRows,
      status: value.status,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    };
  }
}