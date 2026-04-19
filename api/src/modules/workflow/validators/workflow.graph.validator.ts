import { PrismaClient } from "@prisma/client"

export class WorkflowGraphValidator {

  /**
   * Validasi dependency graph
   */
  static async validateDependencyGraph(
    prisma: PrismaClient
  ) {

    const dependencies =
      await prisma.silakapWorkflowDependency.findMany()

    const graph: Record<string, string[]> = {}

    for (const dep of dependencies) {

      const parent = dep.parentJenisLayananId.toString()
      const child = dep.childJenisLayananId.toString()

      if (!graph[parent]) {
        graph[parent] = []
      }

      graph[parent].push(child)

    }

    this.detectCycle(graph, "dependency")

  }

  /**
   * Validasi workflow FSM
   */
  static async validateWorkflowFSM(
    prisma: PrismaClient
  ) {

    const transitions =
      await prisma.silakapWorkflowTransition.findMany()

    const graph: Record<string, string[]> = {}

    for (const t of transitions) {

      const from = t.fromState
      const to = t.toState

      if (!graph[from]) {
        graph[from] = []
      }

      graph[from].push(to)

    }

    this.detectCycle(graph, "workflow")

  }

  /**
   * Detect cycle (DFS)
   */
  private static detectCycle(
    graph: Record<string, string[]>,
    type: string
  ) {

    const visited = new Set<string>()
    const stack = new Set<string>()

    const dfs = (node: string): boolean => {

      if (!visited.has(node)) {

        visited.add(node)
        stack.add(node)

        const children = graph[node] || []

        for (const child of children) {

          if (!visited.has(child) && dfs(child)) {
            return true
          }

          if (stack.has(child)) {
            return true
          }

        }

      }

      stack.delete(node)

      return false

    }

    for (const node of Object.keys(graph)) {

      if (dfs(node)) {

        throw new Error(
          `Circular ${type} graph terdeteksi pada node ${node}`
        )

      }

    }

  }

}