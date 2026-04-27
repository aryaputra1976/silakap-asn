import { BadRequestException, Injectable } from '@nestjs/common';
import type { Express } from 'express';
import * as XLSX from 'xlsx';
import {
  IntegrasiReferenceImportRepository,
  type ReferenceJabatanImportItem,
  type ReferenceUnorImportItem,
} from './integrasi-reference-import.repository';

type JabatanJenis = 'FUNGSIONAL' | 'PELAKSANA' | 'STRUKTURAL';

@Injectable()
export class IntegrasiReferenceImportService {
  constructor(
    private readonly repository: IntegrasiReferenceImportRepository,
  ) {}

  async importJabatanReferences(file: Express.Multer.File, jenis: JabatanJenis) {
    const records = this.readWorkbook(file);
    const items = records
      .map((record) => this.toJabatanItem(record, jenis))
      .filter((item): item is ReferenceJabatanImportItem => item !== null);

    if (items.length === 0) {
      throw new BadRequestException('File referensi jabatan tidak memiliki data valid');
    }

    const result = await this.repository.upsertJabatanReferences(items);

    return {
      type: 'JABATAN',
      jenis,
      fileName: file.originalname,
      totalRows: records.length,
      validRows: items.length,
      created: result.created,
      updated: result.updated,
      skipped: records.length - items.length,
    };
  }

  async importUnorReferences(file: Express.Multer.File) {
    const records = this.readWorkbook(file);
    const items = records
      .map((record) => this.toUnorItem(record))
      .filter((item): item is ReferenceUnorImportItem => item !== null);

    if (items.length === 0) {
      throw new BadRequestException('File referensi UNOR tidak memiliki data valid');
    }

    const result = await this.repository.upsertUnorReferences(items);

    return {
      type: 'UNOR',
      fileName: file.originalname,
      totalRows: records.length,
      validRows: items.length,
      created: result.created,
      updated: result.updated,
      skipped: records.length - items.length,
    };
  }

  private readWorkbook(file: Express.Multer.File): Record<string, unknown>[] {
    const workbook = XLSX.read(file.buffer, {
      type: 'buffer',
      cellDates: false,
      raw: false,
    });

    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      throw new BadRequestException('File Excel tidak memiliki sheet');
    }

    const worksheet = workbook.Sheets[firstSheetName];

    if (!worksheet) {
      throw new BadRequestException('Sheet pertama tidak ditemukan');
    }

    return XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: null,
      raw: false,
    });
  }

  private toJabatanItem(
    record: Record<string, unknown>,
    jenis: JabatanJenis,
  ): ReferenceJabatanImportItem | null {
    const id = this.cleanString(this.pick(record, ['ID', 'id', 'Id']));
    const nama =
      jenis === 'STRUKTURAL'
        ? this.cleanString(
            this.pick(record, ['Nama_jabatan', 'nama_jabatan', 'NAMA_JABATAN']),
          )
        : this.cleanString(this.pick(record, ['Nama', 'nama', 'NAMA']));

    if (!id || !nama) {
      return null;
    }

    return {
      idSiasn: id,
      kode: id,
      nama,
      jenis,
      eselonId:
        jenis === 'STRUKTURAL'
          ? this.cleanString(
              this.pick(record, ['Eselon_id', 'eselon_id', 'ESELON_ID']),
            )
          : null,
      jenjang:
        jenis === 'FUNGSIONAL'
          ? this.cleanString(this.pick(record, ['JENJANG', 'Jenjang', 'jenjang']))
          : null,
      bup:
        jenis === 'FUNGSIONAL'
          ? this.cleanNumber(this.pick(record, ['BUP', 'Bup', 'bup']))
          : null,
      unorNama:
        jenis === 'STRUKTURAL'
          ? this.cleanString(
              this.pick(record, ['Nama_unor', 'nama_unor', 'NAMA_UNOR']),
            )
          : null,
    };
  }

  private toUnorItem(record: Record<string, unknown>): ReferenceUnorImportItem | null {
    const id = this.cleanString(this.pick(record, ['ID', 'id', 'Id']));
    const nama = this.cleanString(this.pick(record, ['Nama', 'nama', 'NAMA']));

    if (!id || !nama) {
      return null;
    }

    return {
      idSiasn: id,
      kode: id,
      nama,
    };
  }

  private pick(record: Record<string, unknown>, keys: string[]) {
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(record, key)) {
        return record[key];
      }
    }

    return null;
  }

  private cleanString(value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const text = String(value).trim();

    return text.length > 0 ? text : null;
  }

  private cleanNumber(value: unknown): number | null {
    const text = this.cleanString(value);

    if (!text) {
      return null;
    }

    const parsed = Number(text);

    return Number.isFinite(parsed) ? parsed : null;
  }
}