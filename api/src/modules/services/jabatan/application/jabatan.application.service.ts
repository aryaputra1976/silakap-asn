import { Prisma } from "@prisma/client"
import { ServiceHandler } from "../../registry/services.registry.types"

import { JabatanSubmitService } from "../service/jabatan.submit.service"

export class JabatanApplicationService implements ServiceHandler {

  private submitService = new JabatanSubmitService()

  async createDetail(
    _tx: Prisma.TransactionClient,
    usulId: bigint,
    payload?: unknown
  ): Promise<void> {

    if (!payload) {
      throw new Error("Payload jabatan tidak tersedia")
    }

    void usulId
    void payload

  }

  async validateSubmit(
    _tx: Prisma.TransactionClient,
    usulId: bigint
  ): Promise<void> {

    void usulId

  }

  async afterSubmit(
    tx: Prisma.TransactionClient,
    usulId: bigint
  ): Promise<void> {

    await this.submitService.execute(tx, usulId)

  }

}
