import { BusinessError } from "@/core/errors/business.error"

import { DBClient } from "../../types/pensiun.types"
import { PensiunCalculationService } from "./pensiun.calculation.service"

export class PensiunSubmitService {

  private calcService = new PensiunCalculationService()

  async execute(
    db: DBClient,
    pensiunId: bigint,
    pegawaiId: bigint
  ) {

    /**
     * LOAD PEGAWAI
     */
    const pegawai = await db.silakapPegawai.findUnique({
      where: { id: pegawaiId },
      select: {

        id: true,
        tanggalLahir: true,
        tmtPns: true,

        mkTahun: true,
        mkBulan: true,

        golonganAktifId: true,

        jabatan: {
          select: {
            bup: true
          }
        }

      }
    })

    if (!pegawai) {
      throw new BusinessError(
        "PEGAWAI_NOT_FOUND",
        "Pegawai tidak ditemukan"
      )
    }

    /**
     * CALCULATE
     */
    const result = await this.calcService.calculate(
      db,
      pegawai
    )

    if (!result) {
      throw new BusinessError(
        "PENSIUN_CALCULATION_FAILED",
        "Perhitungan pensiun gagal"
      )
    }

    const masaKerjaTahun = result.masaKerjaTahun ?? 0
    const masaKerjaBulan = result.masaKerjaBulan ?? 0
    const gajiPokok = result.gajiPokok ?? 0
    const estimasiPensiun = result.estimasi ?? 0

    /**
     * UPSERT PERHITUNGAN
     */
    await db.silakapPensiunPerhitungan.upsert({

      where: { pensiunId },

      update: {
        masaKerjaTahun,
        masaKerjaBulan,
        gajiPokok,
        estimasiPensiun
      },

      create: {
        pensiunId,
        masaKerjaTahun,
        masaKerjaBulan,
        gajiPokok,
        estimasiPensiun
      }

    })

    return {
      pensiunId,
      masaKerjaTahun,
      masaKerjaBulan,
      gajiPokok,
      estimasiPensiun
    }

  }

}