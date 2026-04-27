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

    await this.prisma.$transaction(
      async (tx) => {
        const map = new Map<string, bigint>();

        const idSiasnList = items
          .map((i) => i.idSiasn)
          .filter((id): id is string => Boolean(id));

        // Pre-load existing records to avoid repeated queries inside the loop
        // (MySQL REPEATABLE READ can miss rows inserted earlier in the same tx)
        const existingRows = await tx.refUnor.findMany({
          where: { idSiasn: { in: idSiasnList } },
          select: { id: true, idSiasn: true },
        });
        const existingMap = new Map(
          existingRows.map((r) => [r.idSiasn!, r.id]),
        );

        // Release kode unique slots so sequential updates don't collide with
        // kode values still held by other records in the same batch
        for (const row of existingRows) {
          await tx.refUnor.update({
            where: { id: row.id },
            data: { kode: `_tmp_${row.id.toString()}` },
          });
        }

        // PASS 1: upsert all records with parentId = null
        for (const item of items) {
          const existingId = existingMap.get(item.idSiasn);

          if (existingId) {
            await tx.refUnor.update({
              where: { id: existingId },
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
            map.set(item.idSiasn, existingId);
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

        // PASS 2: resolve parent relationships
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
      },
      { timeout: 60_000 },
    );

    return { created, updated };
  }
}