import { BadRequestException, Injectable } from '@nestjs/common';
import type { Express } from 'express';
import * as XLSX from 'xlsx';
import {
  IntegrasiReferenceImportRepository,
  ReferenceJabatanImportItem,
  ReferenceUnorImportItem,
} from './integrasi-reference-import.repository';

type JabatanJenis = 'FUNGSIONAL' | 'PELAKSANA' | 'STRUKTURAL';

@Injectable()
export class IntegrasiReferenceImportService {
  constructor(
    private readonly repository: IntegrasiReferenceImportRepository,
  ) {}

  async importJabatanReferences(file: Express.Multer.File, jenis: JabatanJenis) {
    const rows = this.readExcelRows(file);
    const items = rows
      .map((row) => this.toJabatanItem(row, jenis))
      .filter((item): item is ReferenceJabatanImportItem => Boolean(item));

    if (items.length === 0) {
      throw new BadRequestException(
        `File referensi jabatan ${jenis} tidak memiliki data valid`,
      );
    }

    const result = await this.repository.upsertJabatanReferences(items);

    return {
      type: 'jabatan',
      jenis,
      fileName: file.originalname,
      totalRows: rows.length,
      validRows: items.length,
      created: result.created,
      updated: result.updated,
      skipped: rows.length - items.length,
    };
  }

  async importUnorReferences(file: Express.Multer.File) {
    const rows = this.readExcelRows(file);
    const rawItems = rows
      .map((row, index) => this.toUnorItem(row, index))
      .filter((item): item is ReferenceUnorImportItem => Boolean(item));

    if (rawItems.length === 0) {
      throw new BadRequestException('File referensi UNOR tidak memiliki data valid');
    }

    const items = this.buildUnorHierarchy(rawItems);
    const result = await this.repository.upsertUnorReferences(items);

    return {
      type: 'unor',
      fileName: file.originalname,
      totalRows: rows.length,
      validRows: items.length,
      created: result.created,
      updated: result.updated,
      skipped: rows.length - items.length,
    };
  }

  private readExcelRows(file: Express.Multer.File): Record<string, unknown>[] {
    const workbook = XLSX.read(file.buffer, {
      type: 'buffer',
      cellDates: false,
      raw: false,
    });

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new BadRequestException('File Excel tidak memiliki sheet');
    }

    const sheet = workbook.Sheets[sheetName];

    return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: null,
      raw: false,
    });
  }

  private toJabatanItem(
    record: Record<string, unknown>,
    jenis: JabatanJenis,
  ): ReferenceJabatanImportItem | null {
    const id = this.cleanString(
      this.pick(record, ['ID', 'Id', 'id', 'JABATAN_ID', 'jabatan_id']),
    );

    const nama = this.cleanString(
      this.pick(record, [
        'NAMA_JABATAN',
        'Nama_jabatan',
        'nama_jabatan',
        'JABATAN_NAMA',
        'jabatan_nama',
        'NAMA',
        'Nama',
        'nama',
      ]),
    );

    if (!id || !nama) return null;

    const jenisJabatanIdMap: Record<JabatanJenis, number> = {
      STRUKTURAL: 1,
      FUNGSIONAL: 2,
      PELAKSANA: 3,
    };

    const kodePrefixMap: Record<JabatanJenis, string> = {
      STRUKTURAL: 'STR',
      FUNGSIONAL: 'JF',
      PELAKSANA: 'JP',
    };

    return {
      idSiasn: id,
      kode: `${kodePrefixMap[jenis]}-${id}`,
      nama,
      jenis,
      jenisJabatanId: jenisJabatanIdMap[jenis],
      eselonId:
        jenis === 'STRUKTURAL'
          ? this.cleanString(
              this.pick(record, ['ESELON_ID', 'Eselon_id', 'eselon_id']),
            )
          : null,
      jenjang:
        jenis === 'FUNGSIONAL'
          ? this.cleanString(
              this.pick(record, ['JENJANG', 'Jenjang', 'jenjang']),
            )
          : null,
      bup:
        jenis === 'FUNGSIONAL'
          ? this.cleanNumber(this.pick(record, ['BUP', 'Bup', 'bup']))
          : null,
      unorNama:
        jenis === 'STRUKTURAL'
          ? this.cleanString(
              this.pick(record, ['NAMA_UNOR', 'Nama_unor', 'nama_unor']),
            )
          : null,
    };
  }

  private toUnorItem(
    record: Record<string, unknown>,
    index: number,
  ): ReferenceUnorImportItem | null {
    const id = this.cleanString(
      this.pick(record, ['ID', 'Id', 'id', 'ID_UNOR', 'id_unor']),
    );

    const nama = this.cleanString(
      this.pick(record, [
        'NAMA_UNOR',
        'Nama_unor',
        'nama_unor',
        'NAMA',
        'Nama',
        'nama',
      ]),
    );

    const parentIdSiasn = this.cleanString(
      this.pick(record, [
        'ID_ATASAN',
        'Id_atasan',
        'id_atasan',
        'PARENT_ID',
        'parent_id',
      ]),
    );

    if (!id || !nama) return null;

    return {
      idSiasn: id,
      kode: `UNOR-${String(index + 1).padStart(4, '0')}`,
      nama,
      parentIdSiasn,
      level: null,
      sortOrder: index + 1,
    };
  }

  private buildUnorHierarchy(
    items: ReferenceUnorImportItem[],
  ): ReferenceUnorImportItem[] {
    const byId = new Map(items.map((item) => [item.idSiasn, item]));
    const childrenByParent = new Map<string, ReferenceUnorImportItem[]>();

    for (const item of items) {
      if (!item.parentIdSiasn || !byId.has(item.parentIdSiasn)) continue;

      const children = childrenByParent.get(item.parentIdSiasn) ?? [];
      children.push(item);
      childrenByParent.set(item.parentIdSiasn, children);
    }

    const roots = items.filter(
      (item) => !item.parentIdSiasn || !byId.has(item.parentIdSiasn),
    );

    if (roots.length === 1) {
      this.assignUnorHierarchy(roots[0], '7204', 1, childrenByParent);
    } else {
      // Multiple roots: use a namespace that cannot collide with children.
      // Children use XX.01, XX.02, ... so roots use XX.R01, XX.R02, ...
      roots.forEach((root, rootIndex) => {
        const rootCode = `7204.R${String(rootIndex + 1).padStart(2, '0')}`;
        this.assignUnorHierarchy(root, rootCode, 1, childrenByParent);
      });
    }

    return items;
  }

  private assignUnorHierarchy(
    item: ReferenceUnorImportItem,
    kode: string,
    level: number,
    childrenByParent: Map<string, ReferenceUnorImportItem[]>,
  ) {
    item.kode = kode;
    item.level = level;

    const children = childrenByParent.get(item.idSiasn) ?? [];

    children.forEach((child, index) => {
      this.assignUnorHierarchy(
        child,
        `${kode}.${String(index + 1).padStart(2, '0')}`,
        level + 1,
        childrenByParent,
      );
    });
  }

  private pick(obj: Record<string, unknown>, keys: string[]) {
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        return obj[key];
      }
    }

    return null;
  }

  private cleanString(value: unknown): string | null {
    if (value === undefined || value === null) return null;

    const cleaned = String(value).trim();
    return cleaned.length > 0 ? cleaned : null;
  }

  private cleanNumber(value: unknown): number | null {
    if (value === undefined || value === null || value === '') return null;

    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  }
}