export class PensiunCalculationEngine {

  private static readonly PERSEN_PER_TAHUN = 0.025
  private static readonly PERSEN_MAKSIMUM = 0.75

  /**
   * Normalisasi tanggal (hapus jam)
   */
  private static normalizeDate(date: Date): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    )
  }

  /**
   * HITUNG USIA
   */
  static hitungUsia(
    tanggalLahir: Date,
    tanggal: Date
  ): number {

    const lahir = this.normalizeDate(tanggalLahir)
    const now = this.normalizeDate(tanggal)

    let usia =
      now.getFullYear() -
      lahir.getFullYear()

    const m =
      now.getMonth() -
      lahir.getMonth()

    if (m < 0 || (m === 0 && now.getDate() < lahir.getDate())) {
      usia--
    }

    return Math.max(usia, 0)

  }

  /**
   * HITUNG TMT PENSIUN
   *
   * ASN biasanya pensiun pada
   * awal bulan berikutnya setelah mencapai BUP
   */
  static hitungTmtPensiun(
    tanggalLahir: Date,
    bup: number
  ): Date {

    if (!tanggalLahir) {
      throw new Error("Tanggal lahir tidak tersedia")
    }

    if (!Number.isFinite(bup) || bup <= 0) {
      throw new Error("BUP tidak valid")
    }

    const lahir = this.normalizeDate(tanggalLahir)

    const tahunPensiun =
      lahir.getFullYear() + bup

    const tanggalBup = new Date(
      tahunPensiun,
      lahir.getMonth(),
      lahir.getDate()
    )

    /**
     * TMT = awal bulan berikutnya
     */
    return new Date(
      tanggalBup.getFullYear(),
      tanggalBup.getMonth() + 1,
      1
    )

  }

  /**
   * HITUNG MASA KERJA
   */
  static hitungMasaKerja(
    tmtPns: Date,
    tanggalPensiun: Date
  ): { tahun: number; bulan: number } {

    const start = this.normalizeDate(tmtPns)
    const end = this.normalizeDate(tanggalPensiun)

    let tahun =
      end.getFullYear() -
      start.getFullYear()

    let bulan =
      end.getMonth() -
      start.getMonth()

    const tanggal =
      end.getDate() -
      start.getDate()

    if (tanggal < 0) {
      bulan--
    }

    if (bulan < 0) {
      tahun--
      bulan += 12
    }

    if (tahun < 0) {
      return { tahun: 0, bulan: 0 }
    }

    return {
      tahun,
      bulan
    }

  }

  /**
   * HITUNG PERSENTASE PENSIUN
   */
  static hitungPersentase(
    masaKerjaTahun: number
  ): number {

    if (!Number.isFinite(masaKerjaTahun) || masaKerjaTahun <= 0) {
      return 0
    }

    const persen =
      masaKerjaTahun *
      this.PERSEN_PER_TAHUN

    const capped =
      Math.min(persen, this.PERSEN_MAKSIMUM)

    return Number(capped.toFixed(4))

  }

  /**
   * HITUNG ESTIMASI PENSIUN
   */
  static hitungEstimasi(
    gajiPokok: number,
    persentase: number
  ): number {

    if (!Number.isFinite(gajiPokok) || gajiPokok <= 0) {
      return 0
    }

    if (!Number.isFinite(persentase) || persentase <= 0) {
      return 0
    }

    const estimasi =
      gajiPokok * persentase

    return Math.round(estimasi)

  }

}