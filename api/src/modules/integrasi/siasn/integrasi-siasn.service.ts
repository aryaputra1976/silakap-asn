import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  INTEGRASI_IMPORT_STATUS,
  type IntegrasiImportStatus,
} from '../import/integrasi-import-status.constant';
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
  totalBatches: number;
  draftBatches: number;
  validatingBatches: number;
  validatedBatches: number;
  validatedWithErrorBatches: number;
  committingBatches: number;
  importedBatches: number;
  failedBatches: number;
  cancelledBatches: number;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  importedRows: number;
};

type SiasnHealthStatus = 'HEALTHY' | 'WARNING' | 'PARTIAL' | 'SYNCING' | 'EMPTY';

@Injectable()
export class IntegrasiSiasnService {
  constructor(private readonly repository: IntegrasiSiasnRepository) {}

  async getSummary() {
    const data = await this.repository.getSummary();

    const runningBatches = data.validatingBatches + data.committingBatches;
    const errorBatches = data.validatedWithErrorBatches + data.failedBatches;
    const healthStatus = this.getHealthStatus(data);

    return {
      status: healthStatus,
      message: this.getHealthMessage(data),
      checkedAt: new Date(),
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
        activePercent: this.calculatePercent(data.activePegawai, data.totalPegawai),
      },
      import: {
        totalBatches: data.totalBatches,
        draftBatches: data.draftBatches,
        validatingBatches: data.validatingBatches,
        validatedBatches: data.validatedBatches,
        validatedWithErrorBatches: data.validatedWithErrorBatches,
        committingBatches: data.committingBatches,
        importedBatches: data.importedBatches,
        failedBatches: data.failedBatches,
        cancelledBatches: data.cancelledBatches,
        runningBatches,
        errorBatches,
        totalRows: data.totalRows,
        validRows: data.validRows,
        invalidRows: data.invalidRows,
        importedRows: data.importedRows,
        importSuccessRatePercent: this.calculatePercent(
          data.importedBatches,
          data.totalBatches,
        ),
        importedRowsPercent: this.calculatePercent(
          data.importedRows,
          data.totalRows,
        ),
      },
      sync: {
        status: healthStatus,
        isHealthy: healthStatus === 'HEALTHY',
        isRunning: runningBatches > 0,
        hasError: errorBatches > 0,
        latestSyncedPegawai: this.toLatestSyncedPegawai(
          data.latestSyncedPegawai,
        ),
        latestImportBatch: this.toLatestImportBatch(data.latestImportBatch),
      },
    };
  }

  async getStatus() {
    const data = await this.repository.getSummary();
    const status = this.getHealthStatus(data);
    const runningBatches = data.validatingBatches + data.committingBatches;
    const errorBatches = data.validatedWithErrorBatches + data.failedBatches;

    return {
      status,
      message: this.getHealthMessage(data),
      isHealthy: status === 'HEALTHY',
      isRunning: runningBatches > 0,
      hasError: errorBatches > 0,
      checkedAt: new Date(),
      counters: {
        totalPegawai: data.totalPegawai,
        pegawaiWithoutSiasnId: data.pegawaiWithoutSiasnId,
        runningBatches,
        errorBatches,
        importedBatches: data.importedBatches,
        failedBatches: data.failedBatches,
        cancelledBatches: data.cancelledBatches,
      },
    };
  }

  private calculatePercent(value: number, total: number) {
    if (total <= 0) {
      return 0;
    }

    return Number(((value / total) * 100).toFixed(2));
  }

  private getHealthStatus(data: SiasnSummaryRaw): SiasnHealthStatus {
    const runningBatches = data.validatingBatches + data.committingBatches;
    const errorBatches = data.validatedWithErrorBatches + data.failedBatches;

    if (data.totalPegawai <= 0 && data.totalBatches <= 0) {
      return 'EMPTY';
    }

    if (runningBatches > 0) {
      return 'SYNCING';
    }

    if (errorBatches > 0) {
      return 'WARNING';
    }

    if (data.pegawaiWithoutSiasnId > 0) {
      return 'PARTIAL';
    }

    return 'HEALTHY';
  }

  private getHealthMessage(data: SiasnSummaryRaw) {
    const runningBatches = data.validatingBatches + data.committingBatches;
    const errorBatches = data.validatedWithErrorBatches + data.failedBatches;

    if (data.totalPegawai <= 0 && data.totalBatches <= 0) {
      return 'Belum ada data pegawai atau batch integrasi SIASN';
    }

    if (runningBatches > 0) {
      return 'Proses integrasi SIASN sedang berjalan';
    }

    if (errorBatches > 0) {
      return 'Terdapat batch integrasi SIASN yang membutuhkan tindak lanjut';
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

    const status = value.status as IntegrasiImportStatus;

    return {
      id: value.id.toString(),
      batchCode: value.batchCode,
      fileName: value.fileName,
      totalRows: value.totalRows,
      validRows: value.validRows,
      invalidRows: value.invalidRows,
      importedRows: value.importedRows,
      status: value.status,
      progress: this.calculateBatchProgress(value),
      hasError: this.hasBatchError(status, value.invalidRows),
      isRunning: this.isBatchRunning(status),
      isFinal: this.isBatchFinal(status),
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    };
  }

  private calculateBatchProgress(value: NonNullable<LatestImportBatch>) {
    const status = value.status as IntegrasiImportStatus;

    if (status === INTEGRASI_IMPORT_STATUS.IMPORTED) {
      return 100;
    }

    if (status === INTEGRASI_IMPORT_STATUS.CANCELLED) {
      return 0;
    }

    if (value.totalRows <= 0) {
      return 0;
    }

    if (value.importedRows > 0) {
      return Math.min(
        100,
        Math.round((value.importedRows / value.totalRows) * 100),
      );
    }

    if (value.validRows + value.invalidRows > 0) {
      return Math.min(
        95,
        Math.round(((value.validRows + value.invalidRows) / value.totalRows) * 100),
      );
    }

    if (status === INTEGRASI_IMPORT_STATUS.VALIDATING) {
      return 25;
    }

    if (status === INTEGRASI_IMPORT_STATUS.COMMITTING) {
      return 95;
    }

    return 10;
  }

  private hasBatchError(status: IntegrasiImportStatus, invalidRows: number) {
    return (
      invalidRows > 0 ||
      status === INTEGRASI_IMPORT_STATUS.VALIDATED_WITH_ERROR ||
      status === INTEGRASI_IMPORT_STATUS.FAILED
    );
  }

  private isBatchRunning(status: IntegrasiImportStatus) {
    return (
      status === INTEGRASI_IMPORT_STATUS.VALIDATING ||
      status === INTEGRASI_IMPORT_STATUS.COMMITTING
    );
  }

  private isBatchFinal(status: IntegrasiImportStatus) {
    return (
      status === INTEGRASI_IMPORT_STATUS.IMPORTED ||
      status === INTEGRASI_IMPORT_STATUS.CANCELLED ||
      status === INTEGRASI_IMPORT_STATUS.FAILED
    );
  }
}