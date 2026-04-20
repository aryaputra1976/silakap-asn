import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"

@Injectable()
export class RefUnorRepository {

  constructor(private prisma: PrismaService) {}

  /* ================= ALL ================= */

  findAll() {

    return this.prisma.refUnor.findMany({

      where: {
        isActive: true,
        deletedAt: null
      },

      orderBy: {
        sortOrder: "asc"
      }

    })

  }

  /* ================= LEVEL 2 ================= */

  findLevel2() {

    return this.prisma.refUnor.findMany({

      where: {
        level: 2,
        isActive: true,
        deletedAt: null
      },

      orderBy: {
        sortOrder: "asc"
      },

      select: {
        id: true,
        nama: true
      }

    })

  }

  /* ================= REGISTER OPTIONS ================= */

  findRegisterOptions() {

    return this.prisma.refUnor.findMany({

      where: {
        level: {
          in: [2, 3]
        },
        isActive: true,
        deletedAt: null
      },

      orderBy: [
        {
          level: "asc"
        },
        {
          sortOrder: "asc"
        },
        {
          nama: "asc"
        }
      ],

      select: {
        id: true,
        nama: true,
        level: true,
        parent: {
          select: {
            id: true,
            nama: true
          }
        }
      }

    })

  }

  /* ================= ROOT ================= */

  async findRoot() {

    const rows = await this.prisma.refUnor.findMany({

      where: {
        parentId: null,
        isActive: true,
        deletedAt: null
      },

      orderBy: {
        sortOrder: "asc"
      },

      select: {
        id: true,
        nama: true,
        parentId: true,
        _count: {
          select: { children: true }
        }
      }

    })

    return rows.map(r => ({
      id: r.id,
      nama: r.nama,
      parentId: r.parentId,
      hasChildren: r._count.children > 0
    }))

  }

  /* ================= CHILDREN ================= */

  async findChildren(parentId: bigint) {

    const rows = await this.prisma.refUnor.findMany({

      where: {
        parentId,
        isActive: true,
        deletedAt: null
      },

      orderBy: {
        sortOrder: "asc"
      },

      select: {
        id: true,
        nama: true,
        parentId: true,
        _count: {
          select: { children: true }
        }
      }

    })

    return rows.map(r => ({
      id: r.id,
      nama: r.nama,
      parentId: r.parentId,
      hasChildren: r._count.children > 0
    }))

  }

  /* ================= DETAIL ================= */

  findById(id: bigint) {

    return this.prisma.refUnor.findUnique({
      where: { id }
    })

  }

  /* ================= TREE COUNT ================= */

  async findWithAsnCount() {

    return this.prisma.refUnor.findMany({

      where: {
        isActive: true,
        deletedAt: null
      },

      orderBy: {
        sortOrder: "asc"
      },

      select: {

        id: true,
        nama: true,
        parentId: true,

        _count: {
          select: {
            pegawaiUnor: true
          }
        }

      }

    })

  }

  /* ================= UNIT STATS ================= */

  async getStats(unorId: bigint) {

    const total = await this.prisma.silakapPegawai.count({
      where: {
        unorId,
        deletedAt: null
      }
    })

    const pns = await this.prisma.silakapPegawai.count({
      where: {
        unorId,
        statusAsn: "PNS",
        deletedAt: null
      }
    })

    const pppk = await this.prisma.silakapPegawai.count({
      where: {
        unorId,
        statusAsn: "PPPK",
        deletedAt: null
      }
    })

    const pppkParuhWaktu = await this.prisma.silakapPegawai.count({
      where: {
        unorId,
        statusAsn: "PPPK_PARUH_WAKTU",
        deletedAt: null
      }
    })

    return {
      total,
      pns,
      pppk,
      pppkParuhWaktu
    }

  }

/* ================= BREADCRUMB ================= */

  async getBreadcrumb(id: bigint) {

    const path: any[] = []

    let current = await this.prisma.refUnor.findUnique({
      where: { id },
      select: {
        id: true,
        nama: true,
        parentId: true
      }
    })

    while (current) {

      path.unshift(current)

      if (!current.parentId) break

      current = await this.prisma.refUnor.findUnique({
        where: { id: current.parentId },
        select: {
          id: true,
          nama: true,
          parentId: true
        }
      })

    }

    return path

  }  

  /* ================= SEARCH ================= */

  async search(q: string) {

    return this.prisma.refUnor.findMany({

      where: {
        level: {
          in: [2, 3]
        },
        nama: {
          contains: q
        },
        isActive: true,
        deletedAt: null
      },

      orderBy: {
        sortOrder: "asc"
      },

      take: 20,

      select: {
        id: true,
        nama: true,
        parentId: true
      }

    })

  } 
}
