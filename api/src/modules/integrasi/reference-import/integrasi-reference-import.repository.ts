import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

export type ReferenceJabatanImportItem = {
  idSiasn: string;
  kode: string;
  nama: string;
  jenis: 'FUNGSIONAL' | 'PELAKSANA' | 'STRUKTURAL';
  jenisJabatanId: number;
  eselonId: string | null;
  jenjang: string | null;
  bup: number | null;
  unorNama: string | null;
};

export type ReferenceUnorImportItem = {
  idSiasn: string;
  kode: string;
  nama: string;
  parentIdSiasn: string | null;
  level: number | null;
  sortOrder: number | null;
};

@Injectable()
export class IntegrasiReferenceImportRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* =========================
     JABATAN
  ========================= */

  async upsertJabatanReferences(items: ReferenceJabatanImportItem[]) {
    let created = 0;
    let updated = 0;

    await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const existing = await tx.refJabatan.findFirst({
          where: { idSiasn: item.idSiasn },
          select: { id: true },
        });

        const data: Prisma.RefJabatanUncheckedCreateInput = {
          idSiasn: item.idSiasn,
          kode: item.kode,
          nama: item.nama,
          jenisJabatanId: item.jenisJabatanId,
          eselonId: item.eselonId,
          jenjang: item.jenjang,
          bup: item.bup,
          unorNama: item.unorNama,
          isActive: true,
        };

        if (existing) {
          await tx.refJabatan.update({
            where: { id: existing.id },
            data,
          });
          updated++;
        } else {
          await tx.refJabatan.create({ data });
          created++;
        }
      }
    });

    return { created, updated };
  }

  /* =========================
     UNOR (HIERARCHY FIX)
  ========================= */

  async upsertUnorReferences(items: ReferenceUnorImportItem[]) {
    let created = 0;
    let updated = 0;

    await this.prisma.$transaction(async (tx) => {
      const map = new Map<string, bigint>();

      // PASS 1
      for (const item of items) {
        const existing = await tx.refUnor.findFirst({
          where: { idSiasn: item.idSiasn },
          select: { id: true },
        });

        if (existing) {
          await tx.refUnor.update({
            where: { id: existing.id },
            data: {
              idSiasn: item.idSiasn,
              kode: item.kode,
              nama: item.nama,
              parentId: null,
              level: item.level,
              sortOrder: item.sortOrder,
              isActive: true,
            },
          });

          map.set(item.idSiasn, existing.id);
          updated++;
        } else {
          const createdRow = await tx.refUnor.create({
            data: {
              idSiasn: item.idSiasn,
              kode: item.kode,
              nama: item.nama,
              parentId: null,
              level: item.level,
              sortOrder: item.sortOrder,
              isActive: true,
            },
            select: { id: true },
          });

          map.set(item.idSiasn, createdRow.id);
          created++;
        }
      }

      // PASS 2 (parent)
      for (const item of items) {
        if (!item.parentIdSiasn) continue;

        const currentId = map.get(item.idSiasn);
        const parentId = map.get(item.parentIdSiasn);

        if (!currentId || !parentId) continue;

        await tx.refUnor.update({
          where: { id: currentId },
          data: { parentId },
        });
      }
    });

    return { created, updated };
  }
}