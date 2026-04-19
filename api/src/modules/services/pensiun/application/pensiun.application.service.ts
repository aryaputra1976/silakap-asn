import { Prisma } from "@prisma/client"

import { ServiceHandler } from "../../registry/services.registry.types"
import { BusinessError } from "@/core/errors/business.error"

import { PensiunSubmitService } from "../domain/services/pensiun.submit.service"
import { PensiunCreateDetailPayload } from "../types/pensiun.types"

export class PensiunApplicationService implements ServiceHandler {

  private submitService = new PensiunSubmitService()

  /**
   * CREATE DETAIL PENSIUN
   */
  async createDetail(
    tx: Prisma.TransactionClient,
    usulId: bigint,
    payload?: PensiunCreateDetailPayload
  ): Promise<void> {

    if (!payload) {
      throw new BusinessError(
        "PENSIUN_PAYLOAD_REQUIRED",
        "Payload pensiun tidak boleh kosong"
      )
    }

    if (!payload.jenisPensiunId) {
      throw new BusinessError(
        "JENIS_PENSIUN_REQUIRED",
        "Jenis pensiun wajib diisi"
      )
    }

    if (!payload.tmtPensiun) {
      throw new BusinessError(
        "TMT_PENSIUN_REQUIRED",
        "TMT pensiun wajib diisi"
      )
    }

    /**
     * CEK DUPLIKASI DETAIL
     */
    const existing = await tx.silakapPensiunDetail.findUnique({
      where: { usulId }
    })

    if (existing) {
      throw new BusinessError(
        "PENSIUN_DETAIL_EXISTS",
        "Detail pensiun sudah pernah dibuat"
      )
    }

    /**
     * LOAD USUL + PEGAWAI
     */
    const usul = await tx.silakapUsulLayanan.findUnique({
      where: { id: usulId },
      include: {
        pegawai: {
          include: {
            golonganAktif: true,
            jabatan: true,
            unor: true
          }
        }
      }
    })

    if (!usul) {
      throw new BusinessError(
        "USUL_NOT_FOUND",
        "Usul layanan tidak ditemukan"
      )
    }

    const pegawai = usul.pegawai

    if (!pegawai) {
      throw new BusinessError(
        "PEGAWAI_NOT_FOUND",
        "Pegawai tidak ditemukan pada usul layanan"
      )
    }

    /**
     * CREATE SNAPSHOT DETAIL
     */
      await tx.silakapPensiunDetail.create({
        data: {

          usulId,

          jenisPensiunId: payload.jenisPensiunId,

          tmtPensiun: new Date(payload.tmtPensiun),

          dasarHukum: payload.dasarHukum ?? null,
          keterangan: payload.keterangan ?? null,

          nipSnapshot: pegawai.nip,
          namaSnapshot: pegawai.nama,

          tempatLahirSnapshot: pegawai.tempatLahir ?? null,
          tanggalLahirSnapshot: pegawai.tanggalLahir ?? null,

          golonganSnapshot: pegawai.golonganAktif?.nama ?? null,
          pangkatSnapshot: pegawai.golonganAktif?.nama ?? null,
          jabatanSnapshot: pegawai.jabatan?.nama ?? null,
          unitKerjaSnapshot: pegawai.unor?.nama ?? null,

          tmtPnsSnapshot: pegawai.tmtPns ?? null,

          masaKerjaTahunSnapshot: pegawai.mkTahun ?? null,
          masaKerjaBulanSnapshot: pegawai.mkBulan ?? null,

          usiaSaatPensiunSnapshot: null

        }
      })

  }

  /**
   * VALIDASI SEBELUM SUBMIT
   */
  async validateSubmit(
    tx: Prisma.TransactionClient,
    usulId: bigint
  ): Promise<void> {

    const pensiun = await tx.silakapPensiunDetail.findUnique({
      where: { usulId }
    })

    if (!pensiun) {
      throw new BusinessError(
        "PENSIUN_DETAIL_NOT_FOUND",
        "Detail pensiun belum dibuat"
      )
    }

  }

  /**
   * AFTER SUBMIT HOOK
   */
  async afterSubmit(
    tx: Prisma.TransactionClient,
    usulId: bigint
  ): Promise<void> {

    const pensiun = await tx.silakapPensiunDetail.findUnique({
      where: { usulId },
      include: {
        usul: {
          select: {
            pegawaiId: true
          }
        }
      }
    })

    if (!pensiun) {
      throw new BusinessError(
        "PENSIUN_NOT_FOUND",
        "Usul pensiun tidak ditemukan"
      )
    }

    await this.submitService.execute(
      tx,
      pensiun.id,
      pensiun.usul.pegawaiId
    )

  }

}