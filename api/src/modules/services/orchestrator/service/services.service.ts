import { Prisma } from "@prisma/client"
import { ServicesRegistry } from "../../registry/services.registry"
import { BusinessError } from "@/core/errors/business.error"

export class ServicesService {

  async createUsul(
    tx: Prisma.TransactionClient,
    pegawaiId: bigint,
    jenisLayananId: bigint,
    jenisKode: string,
    payload?: unknown
  ) {

    if (!pegawaiId) {
      throw new BusinessError(
        "PEGAWAI_REQUIRED",
        "Pegawai tidak tersedia"
      )
    }

    if (!jenisLayananId) {
      throw new BusinessError(
        "LAYANAN_REQUIRED",
        "Jenis layanan tidak tersedia"
      )
    }

    if (!jenisKode) {
      throw new BusinessError(
        "SERVICE_CODE_REQUIRED",
        "Kode layanan tidak tersedia"
      )
    }

    /**
     * CREATE USUL
     */
    const usul = await tx.silakapUsulLayanan.create({
      data: {
        pegawaiId,
        jenisLayananId,
        status: "DRAFT",
        tanggalUsul: new Date()
      },
      select: {
        id: true
      }
    })

    const handler =
      ServicesRegistry.resolve(jenisKode as any)

    /**
     * VALIDASI PAYLOAD
     */
    if (handler?.createDetail && !payload) {
      throw new BusinessError(
        "PAYLOAD_REQUIRED",
        `Payload untuk layanan ${jenisKode} wajib diisi`
      )
    }

    /**
     * CREATE DETAIL
     */
    if (handler?.createDetail) {
      await handler.createDetail(
        tx,
        usul.id,
        payload
      )
    }

    return {
      usulId: usul.id,
      jenisKode
    }

  }

}