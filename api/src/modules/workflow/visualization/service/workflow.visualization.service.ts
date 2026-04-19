import { PrismaClient } from "@prisma/client"
import { WorkflowGraph } from "../types/visualization.types"

export class WorkflowVisualizationService {

  static async buildGraph(
    prisma: PrismaClient,
    jenisLayananId: bigint
  ): Promise<WorkflowGraph> {

    const transitions =
      await prisma.silakapWorkflowTransition.findMany({

        where: { jenisLayananId }

      })

    const nodes = new Map<string, any>()
    const edges = []

    for (const t of transitions) {

      const from = t.fromState
      const to = t.toState

      nodes.set(from, {
        id: from,
        label: from
      })

      nodes.set(to, {
        id: to,
        label: to
      })

      edges.push({
        from,
        to,
        role: t.role
      })

    }

    return {
      nodes: Array.from(nodes.values()),
      edges
    }

  }

}