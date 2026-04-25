import type { Prisma } from '@prisma/client';

type ImportBatchEntity = {
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

type ImportStagingEntity = {
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

export class IntegrasiImportMapper {
  static toBatchListItem(batch: ImportBatchEntity) {
    return {
      id: batch.id.toString(),
      batchCode: batch.batchCode,
      fileName: batch.fileName,
      totalRows: batch.totalRows,
      validRows: batch.validRows,
      invalidRows: batch.invalidRows,
      importedRows: batch.importedRows,
      status: batch.status,
      errors: batch.errors,
      createdAt: batch.createdAt,
      updatedAt: batch.updatedAt,
    };
  }

  static toBatchDetail(batch: ImportBatchEntity) {
    return this.toBatchListItem(batch);
  }

  static toErrorRow(row: ImportStagingEntity) {
    return {
      id: row.id.toString(),
      batchId: row.batchId.toString(),
      rowNumber: row.rowNumber,
      nip: row.nip,
      nik: row.nik,
      nama: row.nama,
      siasnId: row.siasnId,
      rawData: row.rawData,
      mappedData: row.mappedData,
      errors: row.errors,
      isValid: row.isValid,
      isImported: row.isImported,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}