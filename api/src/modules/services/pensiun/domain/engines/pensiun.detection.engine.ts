import { PensiunBUPEngine } from "./pensiun.bup.engine"
import { PensiunCalculationEngine } from "./pensiun.calculation.engine"

type PegawaiDetectionInput = {
  id: bigint
  nip: string
  nama: string
  tanggalLahir: Date | null
  jabatan?: { bup?: number | null } | null
}

type DetectionResult = {
  pegawaiId: bigint
  nip: string
  nama: string
  bup: number
  tmtPensiun: Date
  usiaSaatPensiun: number
}

export class PensiunDetectionEngine {

  private static normalizeDate(date: Date): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    )
  }

  static detectPegawai(
    pegawai: PegawaiDetectionInput
  ): DetectionResult | null {

    if (!pegawai?.tanggalLahir) {
      return null
    }

    const bup =
      PensiunBUPEngine.getBup(
        pegawai.jabatan ?? null
      )

    const tmtPensiun =
      PensiunCalculationEngine.hitungTmtPensiun(
        pegawai.tanggalLahir,
        bup
      )

    const usiaSaatPensiun =
      PensiunCalculationEngine.hitungUsia(
        pegawai.tanggalLahir,
        tmtPensiun
      )

    return {
      pegawaiId: pegawai.id,
      nip: pegawai.nip,
      nama: pegawai.nama,
      bup,
      tmtPensiun,
      usiaSaatPensiun
    }

  }

  static detectCalonPensiun(
    pegawaiList: PegawaiDetectionInput[],
    today: Date
  ): DetectionResult[] {

    const hasil: DetectionResult[] = []
    const now = this.normalizeDate(today)

    for (const pegawai of pegawaiList) {

      const data =
        this.detectPegawai(pegawai)

      if (!data) continue

      const tahunDiff =
        data.tmtPensiun.getFullYear() -
        now.getFullYear()

      if (tahunDiff >= 0 && tahunDiff <= 2) {
        hasil.push(data)
      }

    }

    return hasil

  }

}