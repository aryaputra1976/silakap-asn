import { BusinessError } from "@/core/errors/business.error"

import { DBClient } from "../../types/pensiun.types"

export class PensiunGajiService {

  async getGajiPokok(
    db: DBClient,
    golonganId: bigint,
    masaKerja: number
  ): Promise<number> {

    /**
     * VALIDATION
     */
    if (!golonganId) {
      throw new BusinessError(
        "GOLONGAN_REQUIRED",
        "Golongan pegawai tidak tersedia"
      )
    }

    if (!Number.isFinite(masaKerja) || masaKerja < 0) {
      throw new BusinessError(
        "MASA_KERJA_INVALID",
        "Masa kerja tidak valid"
      )
    }

    /**
     * QUERY REFERENSI GAJI
     */
    const gaji = await db.refGajiPokok.findFirst({

      where: {
        golonganId,
        masaKerja: {
          lte: masaKerja
        }
      },

      orderBy: {
        masaKerja: "desc"
      },

      select: {
        gaji: true
      }

    })

    if (!gaji) {
      throw new BusinessError(
        "GAJI_POKOK_NOT_FOUND",
        "Referensi gaji pokok tidak ditemukan"
      )
    }

    return Number(gaji.gaji)

  }

}