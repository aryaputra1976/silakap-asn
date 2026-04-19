import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"

/**
 * Enterprise UNOR Tree Engine
 *
 * Mengambil seluruh unit organisasi child
 * menggunakan recursive CTE.
 *
 * Digunakan untuk statistik berbasis OPD.
 */
@Injectable()
export class UnorTreeService {
  constructor(private prisma: PrismaService) {}

  /**
   * Return seluruh ID unit dalam subtree
   */
  async getSubtreeIds(unorId: bigint): Promise<bigint[]> {
    const rows = await this.prisma.$queryRawUnsafe<{ id: bigint }[]>(`
      WITH RECURSIVE unor_tree AS (
        SELECT id
        FROM ref_unor
        WHERE id = ${unorId}

        UNION ALL

        SELECT u.id
        FROM ref_unor u
        JOIN unor_tree t ON u.parent_id = t.id
      )
      SELECT id FROM unor_tree
    `)

    return rows.map(r => r.id)
  }
}