import { Injectable } from "@nestjs/common"
import { RefUnorRepository } from "./ref-unor.repository"
import { normalizeBigInt } from "@/utils/normalizeBigInt"

@Injectable()
export class RefUnorService {

  constructor(private readonly repo: RefUnorRepository) {}

  /* ================= LEVEL 2 ================= */

  async findLevel2() {
    const data = await this.repo.findLevel2()
    return normalizeBigInt(data)
  }

  /* ================= DETAIL ================= */

  async findById(id: number) {
    const data = await this.repo.findById(BigInt(id))
    return normalizeBigInt(data)
  }

  /* ================= ROOT ================= */

  async getRoot() {
    const data = await this.repo.findRoot()
    return normalizeBigInt(data)
  }

  /* ================= CHILDREN ================= */

  async getChildren(parentId: number) {
    const data = await this.repo.findChildren(BigInt(parentId))
    return normalizeBigInt(data)
  }

  /* ================= FULL TREE ================= */

  async getTree() {

    const units = await this.repo.findAll()

    const map = new Map<bigint, any>()
    const roots: any[] = []

    for (const u of units) {

      map.set(u.id, {
        id: u.id,
        nama: u.nama,
        parentId: u.parentId,
        children: []
      })

    }

    for (const u of units) {

      if (u.parentId) {

        const parent = map.get(u.parentId)

        if (parent) {
          parent.children.push(map.get(u.id))
        }

      } else {

        roots.push(map.get(u.id))

      }

    }

    return normalizeBigInt(roots)

  }

  /* ================= TREE WITH ASN COUNT ================= */

  async getTreeWithCount() {

    const units = await this.repo.findWithAsnCount()

    const map = new Map<bigint, any>()
    const roots: any[] = []

    for (const u of units) {

      map.set(u.id, {
        id: u.id,
        nama: u.nama,
        parentId: u.parentId,
        asnCount: u._count.pegawaiUnor,
        children: []
      })

    }

    for (const u of units) {

      if (u.parentId) {

        const parent = map.get(u.parentId)

        if (parent) {
          parent.children.push(map.get(u.id))
        }

      } else {

        roots.push(map.get(u.id))

      }

    }

    return normalizeBigInt(roots)

  }

  /* ================= STATS ================= */

  async getStats(id: number) {

    const stats = await this.repo.getStats(BigInt(id))

    return normalizeBigInt(stats)

  }

  /* ================= BREADCRUMB ================= */

  async getBreadcrumb(id: number) {

    const data = await this.repo.getBreadcrumb(BigInt(id))

    return normalizeBigInt(data)

  }

  async search(q: string) {

    const data = await this.repo.search(q)

    return normalizeBigInt(data)

  }
}