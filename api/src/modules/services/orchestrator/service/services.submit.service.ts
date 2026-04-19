import { Prisma } from "@prisma/client"
import { ServicesRegistry } from "../../registry/services.registry"
import { ServicesEngine } from "../services.engine"
import { BusinessError } from "@/core/errors/business.error"

export class ServicesSubmitService {

  async submit(
    tx: Prisma.TransactionClient,
    params: {
      usulId: bigint
      jenisKode: string
      actorRoleId?: bigint
    }
  ) {

    const { usulId, jenisKode, actorRoleId } = params

    if (!usulId) {
      throw new BusinessError(
        "USUL_ID_REQUIRED",
        "ID usul tidak tersedia"
      )
    }

    if (!jenisKode) {
      throw new BusinessError(
        "SERVICE_CODE_REQUIRED",
        "Kode layanan tidak tersedia"
      )
    }

    /**
     * AMBIL DATA USUL
     */
    const usul =
      await tx.silakapUsulLayanan.findUnique({

        where: { id: usulId },

        select: {
          id: true,
          status: true,
          pegawaiId: true,
          jenisLayananId: true
        }

      })

    if (!usul) {
      throw new BusinessError(
        "USUL_NOT_FOUND",
        "Usul layanan tidak ditemukan"
      )
    }

    /**
     * VALIDASI STATUS
     */
    if (usul.status !== "DRAFT") {
      throw new BusinessError(
        "INVALID_SUBMIT_STATE",
        "Usul hanya bisa disubmit dari status DRAFT"
      )
    }

    /**
     * RESOLVE SERVICE HANDLER
     */
    const handler =
      ServicesRegistry.resolve(
        jenisKode as any
      )

    /**
     * VALIDASI DOMAIN SUBMIT
     */
    if (handler?.validateSubmit) {

      await handler.validateSubmit(
        tx,
        usulId
      )

    }

    /**
     * AFTER SUBMIT HOOK
     */
    if (handler?.afterSubmit) {

      await handler.afterSubmit(
        tx,
        usulId
      )

    }

    /**
     * EXECUTE WORKFLOW ENGINE
     * ACTION: SUBMIT
     */
    const engine = new ServicesEngine()

    const result =
      await engine.execute(
        tx,
        {
          usulId,
          pegawaiId: usul.pegawaiId,
          jenisLayananId: usul.jenisLayananId,
          actionCode: "SUBMIT",
          actorRoleId
        }
      )

    return {
      usulId,
      submitted: true,
      status: result.status,
      slaDeadline: result.slaDeadline
    }

  }

}