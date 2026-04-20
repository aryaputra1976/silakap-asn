import { Injectable } from '@nestjs/common'
import { LayananStatus, Prisma } from '@prisma/client'

import { BusinessError } from '@/core/errors/business.error'

type DependencyGraph = Record<string, string[]>

@Injectable()
export class ServicesDependencyService {
  async validateDependencies(
    tx: Prisma.TransactionClient,
    usulId: bigint,
  ) {
    const usul = await tx.silakapUsulLayanan.findUnique({
      where: { id: usulId },
      select: {
        pegawaiId: true,
        jenisLayananId: true,
      },
    })

    if (!usul) {
      throw new BusinessError(
        'USUL_NOT_FOUND',
        'Usul tidak ditemukan',
      )
    }

    const dependencies =
      await tx.silakapWorkflowDependency.findMany({
        where: {
          childJenisLayananId: usul.jenisLayananId,
        },
        select: {
          parentJenisLayananId: true,
          triggerStatus: true,
          parentJenis: {
            select: {
              id: true,
              nama: true,
            },
          },
        },
      })

    if (!dependencies.length) {
      return true
    }

    const parentJenisIds = dependencies.map(
      (dependency) => dependency.parentJenisLayananId,
    )

    const parents =
      await tx.silakapUsulLayanan.findMany({
        where: {
          pegawaiId: usul.pegawaiId,
          jenisLayananId: {
            in: parentJenisIds,
          },
        },
        orderBy: {
          tanggalUsul: 'desc',
        },
        select: {
          jenisLayananId: true,
          status: true,
        },
      })

    const parentMap = new Map<string, LayananStatus>()

    for (const parent of parents) {
      const key = parent.jenisLayananId.toString()

      if (!parentMap.has(key)) {
        parentMap.set(key, parent.status)
      }
    }

    const errors: string[] = []

    for (const dependency of dependencies) {
      const parentStatus = parentMap.get(
        dependency.parentJenisLayananId.toString(),
      )

      if (!parentStatus) {
        errors.push(
          `Layanan "${dependency.parentJenis.nama}" harus diajukan terlebih dahulu`,
        )
        continue
      }

      if (parentStatus !== dependency.triggerStatus) {
        errors.push(
          `Layanan "${dependency.parentJenis.nama}" harus berstatus ${dependency.triggerStatus}`,
        )
      }
    }

    if (errors.length) {
      throw new BusinessError(
        'DEPENDENCY_NOT_MET',
        errors.join('\n'),
      )
    }

    return true
  }

  async validateDependencyGraph(
    tx: Prisma.TransactionClient,
  ) {
    const graph = await this.buildGraph(tx)
    const hasCycle = this.detectCycle(graph)

    if (hasCycle) {
      throw new BusinessError(
        'CIRCULAR_DEPENDENCY',
        'Terdapat circular dependency antar layanan',
      )
    }

    return true
  }

  private async buildGraph(
    tx: Prisma.TransactionClient,
  ): Promise<DependencyGraph> {
    const dependencies =
      await tx.silakapWorkflowDependency.findMany({
        select: {
          parentJenisLayananId: true,
          childJenisLayananId: true,
        },
      })

    const graph: DependencyGraph = {}

    for (const dependency of dependencies) {
      const parent = dependency.parentJenisLayananId.toString()
      const child = dependency.childJenisLayananId.toString()

      if (!graph[parent]) {
        graph[parent] = []
      }

      graph[parent].push(child)
    }

    return graph
  }

  private detectCycle(graph: DependencyGraph): boolean {
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

      const neighbors = graph[node] ?? []

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
