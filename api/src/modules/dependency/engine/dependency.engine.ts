import { Prisma, LayananStatus } from "@prisma/client"
import { DependencyResult } from "../types/dependency.types"
import { getDependencyRules } from "../rules/dependency.rules"
import { dependencyValidators } from "../validators/dependency.validator"

export class DependencyEngine {

  /**
   * VALIDASI dependency manual
   */
  static async validate(
    tx: Prisma.TransactionClient,
    pegawaiId: bigint,
    layananCode: string
  ): Promise<DependencyResult[]> {

    const rules = getDependencyRules(layananCode)

    const results: DependencyResult[] = []

    for (const rule of rules) {

      const validator = dependencyValidators[rule]

      if (!validator) {

        results.push({
          dependency: rule,
          status: "PENDING"
        })

        continue

      }

      const status =
        await validator(tx, pegawaiId)

      results.push({
        dependency: rule,
        status
      })

    }

    return results

  }

  /**
   * Trigger dependency workflow
   */
  static async trigger(
    tx: Prisma.TransactionClient,
    parentJenisLayananId: bigint,
    status: LayananStatus,
    parentUsulId: bigint
  ) {

    /**
     * Ambil parent layanan
     */
    const parent =
      await tx.silakapUsulLayanan.findUnique({
        where: { id: parentUsulId },
        select: {
          pegawaiId: true
        }
      })

    if (!parent) {
      throw new Error("Parent layanan tidak ditemukan")
    }

    const dependencies =
      await tx.silakapWorkflowDependency.findMany({

        where: {
          parentJenisLayananId,
          triggerStatus: status
        }

      })

    if (!dependencies.length) return

    for (const dep of dependencies) {

      if (!dep.autoCreate) continue

      /**
       * Idempotency check
       */
      const existing =
        await tx.silakapUsulLayanan.findFirst({

          where: {
            pegawaiId: parent.pegawaiId,
            jenisLayananId: dep.childJenisLayananId
          },

          select: { id: true }

        })

      if (existing) continue

      /**
       * Buat child layanan
       */
      await tx.silakapUsulLayanan.create({

        data: {

          pegawaiId: parent.pegawaiId,

          jenisLayananId: dep.childJenisLayananId,

          status: dep.blockingStatus

        }

      })

    }

  }

}