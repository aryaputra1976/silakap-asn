import { Prisma, LayananStatus } from '@prisma/client'
import { BusinessError } from '@/core/errors/business.error'

type DependencyGraph = Record<string, string[]>

export class ServicesDependencyService {

  /**
   * VALIDASI DEPENDENCY SAAT SUBMIT / WORKFLOW
   */
  async validateDependencies(
    tx: Prisma.TransactionClient,
    usulId: bigint
  ) {

    /**
     * Ambil usul
     */
    const usul = await tx.silakapUsulLayanan.findUnique({
      where: { id: usulId },
      select: {
        pegawaiId: true,
        jenisLayananId: true
      }
    })

    if (!usul) {
      throw new BusinessError(
        'USUL_NOT_FOUND',
        'Usul tidak ditemukan'
      )
    }

    const pegawaiId = usul.pegawaiId
    const childJenisLayananId = usul.jenisLayananId

    /**
     * 1. Ambil dependency rules
     */
    const dependencies = await tx.silakapWorkflowDependency.findMany({
      where: {
        childJenisLayananId
      },
      select: {
        parentJenisLayananId: true,
        triggerStatus: true,
        parentJenis: {
          select: {
            id: true,
            nama: true
          }
        }
      }
    })

    if (!dependencies.length) {
      return true
    }

    /**
     * 2. Ambil parent jenis layanan
     */
    const parentJenisIds = dependencies.map(
      d => d.parentJenisLayananId
    )

    /**
     * 3. Ambil usul parent milik pegawai
     */
    const parents = await tx.silakapUsulLayanan.findMany({

      where: {
        pegawaiId,
        jenisLayananId: {
          in: parentJenisIds
        }
      },

      orderBy: {
        tanggalUsul: 'desc'
      },

      select: {
        jenisLayananId: true,
        status: true
      }

    })

    /**
     * Map parent berdasarkan jenis layanan
     */
    const parentMap = new Map<string, LayananStatus>()

    for (const p of parents) {

      const key = p.jenisLayananId.toString()

      if (!parentMap.has(key)) {
        parentMap.set(key, p.status)
      }

    }

    /**
     * 4. Validasi dependency
     */
    const errors: string[] = []

    for (const dep of dependencies) {

      const parentStatus =
        parentMap.get(dep.parentJenisLayananId.toString())

      /**
       * Parent belum pernah diajukan
       */
      if (!parentStatus) {

        errors.push(
          `Layanan "${dep.parentJenis.nama}" harus diajukan terlebih dahulu`
        )

        continue
      }

      /**
       * Parent belum mencapai trigger status
       */
      if (parentStatus !== dep.triggerStatus) {

        errors.push(
          `Layanan "${dep.parentJenis.nama}" harus berstatus ${dep.triggerStatus}`
        )

      }

    }

    if (errors.length) {

      throw new BusinessError(
        'DEPENDENCY_NOT_MET',
        errors.join('\n')
      )

    }

    return true

  }

  /**
   * ==================================
   * VALIDASI CIRCULAR DEPENDENCY
   * ==================================
   */

  async validateDependencyGraph(
    tx: Prisma.TransactionClient
  ) {

    const graph = await this.buildGraph(tx)

    const hasCycle = this.detectCycle(graph)

    if (hasCycle) {

      throw new BusinessError(
        'CIRCULAR_DEPENDENCY',
        'Terdapat circular dependency antar layanan'
      )

    }

    return true

  }

  /**
   * BUILD GRAPH
   */
  private async buildGraph(
    tx: Prisma.TransactionClient
  ): Promise<DependencyGraph> {

    const deps = await tx.silakapWorkflowDependency.findMany({
      select: {
        parentJenisLayananId: true,
        childJenisLayananId: true
      }
    })

    const graph: DependencyGraph = {}

    for (const d of deps) {

      const parent = d.parentJenisLayananId.toString()
      const child = d.childJenisLayananId.toString()

      if (!graph[parent]) {
        graph[parent] = []
      }

      graph[parent].push(child)

    }

    return graph

  }

  /**
   * DETECT CYCLE (DFS)
   */
  private detectCycle(
    graph: DependencyGraph
  ): boolean {

    const visited = new Set<string>()
    const stack = new Set<string>()

    const visit = (node: string): boolean => {

      if (stack.has(node)) {
        return true
      }

      if (visited.has(node)) {
        return false
      }

      visited.add(node)
      stack.add(node)

      const neighbors = graph[node] || []

      for (const next of neighbors) {

        if (visit(next)) {
          return true
        }

      }

      stack.delete(node)

      return false

    }

    for (const node of Object.keys(graph)) {

      if (visit(node)) {
        return true
      }

    }

    return false

  }

}