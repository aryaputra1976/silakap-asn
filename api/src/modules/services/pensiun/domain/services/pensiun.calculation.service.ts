import { BusinessError } from "@/core/errors/business.error"

import { DBClient } from "../../types/pensiun.types"
import { PensiunCalculationEngine } from "../engines/pensiun.calculation.engine"
import { PensiunGajiService } from "./pensiun.gaji.service"

type PegawaiCalculationInput = {
  id: bigint
  tanggalLahir: Date | null
  tmtPns: Date | null
  golonganAktifId: bigint | null
  jabatan?: {
    bup: number | null
  } | null
}

export class PensiunCalculationService {

  private gajiService = new PensiunGajiService()

  async calculate(
    db: DBClient,
    pegawai: PegawaiCalculationInput
  ) {

    /**
     * VALIDATION
     */
    if (!pegawai) {
      throw new BusinessError(
        "PEGAWAI_REQUIRED",
        "Data pegawai tidak tersedia"
      )
    }

    if (!pegawai.tanggalLahir) {
      throw new BusinessError(
        "TANGGAL_LAHIR_REQUIRED",
        "Tanggal lahir pegawai tidak tersedia"
      )
    }

    if (!pegawai.tmtPns) {
      throw new BusinessError(
        "TMT_PNS_REQUIRED",
        "TMT PNS pegawai tidak tersedia"
      )
    }

    if (!pegawai.jabatan?.bup) {
      throw new BusinessError(
        "BUP_REQUIRED",
        "BUP jabatan tidak tersedia"
      )
    }

    if (!pegawai.golonganAktifId) {
      throw new BusinessError(
        "GOLONGAN_REQUIRED",
        "Golongan aktif pegawai tidak tersedia"
      )
    }

    /**
     * HITUNG TMT PENSIUN
     */
    const tmtPensiun =
      PensiunCalculationEngine.hitungTmtPensiun(
        pegawai.tanggalLahir,
        pegawai.jabatan.bup
      )

    /**
     * HITUNG MASA KERJA
     */
    const masaKerja =
      PensiunCalculationEngine.hitungMasaKerja(
        pegawai.tmtPns,
        tmtPensiun
      )

    /**
     * AMBIL GAJI POKOK
     */
    const gajiPokok =
      await this.gajiService.getGajiPokok(
        db,
        pegawai.golonganAktifId,
        masaKerja.tahun
      )

    const gajiPokokNumber = Number(gajiPokok ?? 0)

    /**
     * HITUNG PERSENTASE PENSIUN
     */
    const persentase =
      PensiunCalculationEngine.hitungPersentase(
        masaKerja.tahun
      )

    /**
     * HITUNG ESTIMASI PENSIUN
     */
    const estimasi =
      PensiunCalculationEngine.hitungEstimasi(
        gajiPokokNumber,
        persentase
      )

    return {

      masaKerjaTahun: masaKerja.tahun,
      masaKerjaBulan: masaKerja.bulan,

      tmtPensiun,

      gajiPokok: gajiPokokNumber,

      persentase,

      estimasi

    }

  }

}