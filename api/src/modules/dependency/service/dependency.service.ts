import { Prisma } from "@prisma/client"
import { DependencyEngine } from "../engine/dependency.engine"
import { DependencyResult } from "../types/dependency.types"

export class DependencyService {

  async validate(
    tx: Prisma.TransactionClient,
    pegawaiId: bigint,
    layananCode: string
  ): Promise<DependencyResult[]> {

    const results =
      await DependencyEngine.validate(
        tx,
        pegawaiId,
        layananCode
      )

    const hasPending =
      results.some((r: DependencyResult) =>
        r.status === "PENDING"
      )

    if (hasPending) {
      throw new Error(
        "Dependency layanan belum terpenuhi"
      )
    }

    return results
  }

}