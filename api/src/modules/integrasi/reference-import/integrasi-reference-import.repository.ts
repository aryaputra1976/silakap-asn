import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
};

@Injectable()
export class IntegrasiReferenceImportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertJabatanReferences(items: ReferenceJabatanImportItem[]) {
    if (items.length === 0) {
      return { created: 0, updated: 0 };
    }

    let created = 0;
    let updated = 0;

    await this.prisma.$transaction(
      async (tx) => {
        for (const item of items) {
          const existing = await tx.refJabatan.findFirst({
            where: {
              OR: [{ idSiasn: item.idSiasn }, { kode: item.kode }],
            },
            select: { id: true },
          });

          const data: Prisma.RefJabatanUncheckedUpdateInput = {
            idSiasn: item.idSiasn,
            kode: item.kode,
            nama: item.nama,
            jenisJabatanId: item.jenisJabatanId,
            eselonId: item.eselonId,
            jenjang: item.jenjang,
            bup: item.bup,
            unorNama: item.unorNama,
            deletedAt: null,
            isActive: true,
          };

          if (existing) {
            await tx.refJabatan.update({
              where: { id: existing.id },
              data,
            });

            updated += 1;
          } else {
            await tx.refJabatan.create({
              data: {
                idSiasn: item.idSiasn,
                kode: item.kode,
                nama: item.nama,
                jenisJabatanId: item.jenisJabatanId,
                eselonId: item.eselonId,
                jenjang: item.jenjang,
                bup: item.bup,
                unorNama: item.unorNama,
                isActive: true,
              },
            });

            created += 1;
          }
        }
      },
      {
        timeout: 60_000,
        maxWait: 10_000,
      },
    );

    return { created, updated };
  }

  async upsertUnorReferences(items: ReferenceUnorImportItem[]) {
    if (items.length === 0) {
      return { created: 0, updated: 0 };
    }

    let created = 0;
    let updated = 0;

    await this.prisma.$transaction(
      async (tx) => {
        for (const item of items) {
          const existing = await tx.refUnor.findFirst({
            where: {
              OR: [{ idSiasn: item.idSiasn }, { kode: item.kode }],
            },
            select: { id: true },
          });

          if (existing) {
            await tx.refUnor.update({
              where: { id: existing.id },
              data: {
                idSiasn: item.idSiasn,
                kode: item.kode,
                nama: item.nama,
                deletedAt: null,
                isActive: true,
              },
            });

            updated += 1;
          } else {
            await tx.refUnor.create({
              data: {
                idSiasn: item.idSiasn,
                kode: item.kode,
                nama: item.nama,
                parentId: null,
                level: null,
                formasiIdeal: null,
                kecamatanId: null,
                sortOrder: null,
                isActive: true,
              },
            });

            created += 1;
          }
        }
      },
      {
        timeout: 60_000,
        maxWait: 10_000,
      },
    );

    return { created, updated };
  }
}