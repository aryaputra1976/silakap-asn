import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"
import { QueryAsnDto } from "./dto/query-asn.dto"

@Injectable()
export class AsnRepository {

  constructor(private prisma: PrismaService) {}

  /* ======================================================
     HELPER : GET DESCENDANT UNOR IDS
  ====================================================== */

  private async getDescendantUnorIds(rootId: bigint) {

    const units = await this.prisma.refUnor.findMany({
      select: {
        id: true,
        parentId: true
      }
    })

    const childMap = new Map<bigint, bigint[]>()

    for (const u of units) {

      if (!u.parentId) continue

      if (!childMap.has(u.parentId)) {
        childMap.set(u.parentId, [])
      }

      childMap.get(u.parentId)!.push(u.id)

    }

    const stack: bigint[] = [rootId]
    const resultIds: bigint[] = []

    while (stack.length) {

      const current = stack.pop()!

      resultIds.push(current)

      const children = childMap.get(current)

      if (!children) continue

      for (const child of children) {
        stack.push(child)
      }

    }

    return resultIds

  }

  /* ======================================================
     LIST ASN
  ====================================================== */

  async findAll(query: QueryAsnDto) {

    const page = Number(query.page ?? 1)
    const limit = Number(query.limit ?? 20)
    const skip = (page - 1) * limit

    const where: any = {
      deletedAt: null,
      statusAktif: true,
    }

    /* STATUS */

    if (query.status) {
      where.statusAsn = query.status
    }

    /* UNIT ORGANISASI */

    if (query.unorId) {

      const ids = await this.getDescendantUnorIds(BigInt(query.unorId))

      where.unorId = {
        in: ids
      }

    }

    /* FILTER JABATAN */

    if (query.jenisJabatanId) {

      const jabatanMap: Record<string, string> = {
        STRUKTURAL: "Struktural",
        FUNGSIONAL: "Fungsional",
        PELAKSANA: "Pelaksana"
      }

      const jenisNama = jabatanMap[query.jenisJabatanId]

      if (jenisNama) {

        where.jenisJabatan = {
          nama: {
            contains: jenisNama
          }
        }

      }

    }

    /* SEARCH */

    if (query.search) {

      const keyword = query.search.trim()

      where.OR = [
        { nama: { contains: keyword } },
        { nip: { contains: keyword } }
      ]

    }

    const [data, total] = await this.prisma.$transaction([

      this.prisma.silakapPegawai.findMany({

        where,
        skip,
        take: limit,

        orderBy: {
          nama: "asc"
        },

        include: {

          golonganAktif: {
            select: { nama: true }
          },

          jabatan: {
            select: { nama: true }
          },

          jenisJabatan: {
            select: { nama: true }
          },

          unor: {
            select: { nama: true }
          }

        }

      }),

      this.prisma.silakapPegawai.count({ where })

    ])

    return {
      data,
      meta: {
        total,
        page,
        limit
      }
    }

  }

  /* ======================================================
     DETAIL ASN
  ====================================================== */

  async findById(
    id: bigint,
    scopedUnorId?: string,
  ) {
    let allowedUnorIds: bigint[] | undefined

    if (scopedUnorId) {
      allowedUnorIds = await this.getDescendantUnorIds(
        BigInt(scopedUnorId),
      )
    }

    return this.prisma.silakapPegawai.findFirst({

      where: {
        id,
        deletedAt: null,
        statusAktif: true,
        ...(allowedUnorIds
          ? {
              unorId: {
                in: allowedUnorIds,
              },
            }
          : {}),
      },

      include: {

        golonganAktif: true,
        jabatan: true,
        jenisJabatan: true,
        unor: true,
        satkerKerja: true

      }

    })

  }

  /* ======================================================
     STATISTIK ASN
  ====================================================== */

  async getStats(unorId?: string) {

    const where: any = {
      deletedAt: null,
      statusAktif: true,
    }

    if (unorId) {

      const ids = await this.getDescendantUnorIds(BigInt(unorId))

      where.unorId = {
        in: ids
      }

    }

    const [total, pns, pppk, pppkParuhWaktu] = await Promise.all([

      this.prisma.silakapPegawai.count({
        where
      }),

      this.prisma.silakapPegawai.count({
        where: {
          ...where,
          statusAsn: "PNS"
        }
      }),

      this.prisma.silakapPegawai.count({
        where: {
          ...where,
          statusAsn: "PPPK"
        }
      }),

      this.prisma.silakapPegawai.count({
        where: {
          ...where,
          statusAsn: "PPPK_PARUH_WAKTU"
        }
      })

    ])

    return {
      total,
      pns,
      pppk,
      pppkParuhWaktu
    }

  }

}
