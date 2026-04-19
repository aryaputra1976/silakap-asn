export class PensiunBUPEngine {

  private static readonly DEFAULT_BUP = 58

  static getBup(
    jabatan: { bup?: number | null } | null
  ): number {

    const bup = jabatan?.bup

    if (!Number.isFinite(bup) || (bup as number) <= 0) {
      return this.DEFAULT_BUP
    }

    return Number(bup)

  }

}