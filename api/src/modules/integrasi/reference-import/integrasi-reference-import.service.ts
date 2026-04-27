import { Injectable } from '@nestjs/common';
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

  /* =========================
     JABATAN
  ========================= */

  async importJabatan(
    rows: Record<string, unknown>[],
    jenis: JabatanJenis,
  ) {
    const items: ReferenceJabatanImportItem[] = [];

    for (const record of rows) {
      const item = this.toJabatanItem(record, jenis);
      if (item) items.push(item);
    }

    return this.repository.upsertJabatanReferences(items);
  }

  private toJabatanItem(
    record: Record<string, unknown>,
    jenis: JabatanJenis,
  ): ReferenceJabatanImportItem | null {
    const id = this.cleanString(
      this.pick(record, ['ID', 'Id', 'id', 'JABATAN_ID']),
    );

    const nama = this.cleanString(
      this.pick(record, [
        'NAMA_JABATAN',
        'Nama_jabatan',
        'nama_jabatan',
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
              this.pick(record, ['ESELON_ID', 'eselon_id']),
            )
          : null,
      jenjang:
        jenis === 'FUNGSIONAL'
          ? this.cleanString(this.pick(record, ['JENJANG']))
          : null,
      bup:
        jenis === 'FUNGSIONAL'
          ? this.cleanNumber(this.pick(record, ['BUP']))
          : null,
      unorNama:
        jenis === 'STRUKTURAL'
          ? this.cleanString(
              this.pick(record, ['NAMA_UNOR', 'nama_unor']),
            )
          : null,
    };
  }

  /* =========================
     UNOR
  ========================= */

  async importUnor(rows: Record<string, unknown>[]) {
    const items: ReferenceUnorImportItem[] = [];

    rows.forEach((row, index) => {
      const item = this.toUnorItem(row, index);
      if (item) items.push(item);
    });

    return this.repository.upsertUnorReferences(items);
  }

  private toUnorItem(
    record: Record<string, unknown>,
    index: number,
  ): ReferenceUnorImportItem | null {
    const id = this.cleanString(
      this.pick(record, ['ID', 'id', 'ID_UNOR']),
    );

    const nama = this.cleanString(
      this.pick(record, ['NAMA_UNOR', 'nama_unor', 'NAMA']),
    );

    const parentIdSiasn = this.cleanString(
      this.pick(record, ['ID_ATASAN', 'id_atasan']),
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

  /* =========================
     HELPERS
  ========================= */

  private pick(obj: Record<string, unknown>, keys: string[]) {
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        return obj[key];
      }
    }
    return null;
  }

  private cleanString(value: unknown): string | null {
    if (!value) return null;
    const v = String(value).trim();
    return v.length ? v : null;
  }

  private cleanNumber(value: unknown): number | null {
    if (!value) return null;
    const n = Number(value);
    return isNaN(n) ? null : n;
  }
}