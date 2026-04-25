import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { QueryIntegrasiLogsDto } from './dto/query-integrasi-logs.dto';
import { IntegrasiLogsRepository } from './integrasi-logs.repository';

type ImportBatchLog = {
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
};

type ImportStagingRow = {
  id: bigint;
  batchId: bigint;
  rowNumber: number;
  nip: string | null;
  nik: string | null;
  nama: string | null;
  siasnId: string | null;
  rawData: Prisma.JsonValue;
  mappedData: Prisma.JsonValue | null;
  errors: Prisma.JsonValue | null;
  isValid: boolean;
  isImported: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class IntegrasiLogsService {
  constructor(private readonly repository: IntegrasiLogsRepository) {}

  async findLogs(query: QueryIntegrasiLogsDto) {
    const result = await this.repository.findLogs(query);

    return {
      data: result.items.map((item) => this.toLogListItem(item)),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  async findLogDetail(id: bigint) {
    const log = await this.repository.findLogById(id);

    if (!log) {
      throw new NotFoundException('Riwayat sinkronisasi tidak ditemukan');
    }

    return {
      id: log.id.toString(),
      type: 'IMPORT_PEGAWAI',
      title: `Import Pegawai - ${log.fileName}`,
      batchCode: log.batchCode,
      fileName: log.fileName,
      status: log.status,
      totalRows: log.totalRows,
      validRows: log.validRows,
      invalidRows: log.invalidRows,
      importedRows: log.importedRows,
      errors: log.errors,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
      rows: log.rows.map((row) => this.toRowItem(row)),
    };
  }

  async getSummary() {
    return this.repository.getSummary();
  }

  private toLogListItem(item: ImportBatchLog) {
    return {
      id: item.id.toString(),
      type: 'IMPORT_PEGAWAI',
      title: `Import Pegawai - ${item.fileName}`,
      batchCode: item.batchCode,
      fileName: item.fileName,
      status: item.status,
      totalRows: item.totalRows,
      validRows: item.validRows,
      invalidRows: item.invalidRows,
      importedRows: item.importedRows,
      hasError: item.invalidRows > 0 || item.status === 'VALIDATED_WITH_ERROR',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private toRowItem(row: ImportStagingRow) {
    return {
      id: row.id.toString(),
      batchId: row.batchId.toString(),
      rowNumber: row.rowNumber,
      nip: row.nip,
      nik: row.nik,
      nama: row.nama,
      siasnId: row.siasnId,
      isValid: row.isValid,
      isImported: row.isImported,
      errors: row.errors,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}