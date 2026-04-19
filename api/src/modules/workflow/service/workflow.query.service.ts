import { PrismaClient, LayananStatus } from "@prisma/client"

export class WorkflowQueryService {

  static async getStatus(
    prisma: PrismaClient,
    usulId: bigint
  ) {

    return prisma.silakapUsulLayanan.findUnique({
      where: { id: usulId },
      select: {
        id: true,
        status: true
      }
    })

  }

  /**
   * Ambil semua transition untuk layanan tertentu
   */
  static async getTransitions(
    prisma: PrismaClient,
    jenisLayananId: bigint
  ) {

    return prisma.silakapWorkflowTransition.findMany({

      where: {
        jenisLayananId
      },

      select: {
        fromState: true,
        toState: true,
        role: true
      }

    })

  }

}