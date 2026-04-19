export class PensiunTimelineEngine {

  private static normalizeDate(date: Date): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    )
  }

  static hitungTimeline(
    tmtPensiun: Date
  ) {

    if (!tmtPensiun || !(tmtPensiun instanceof Date)) {
      throw new Error("TMT pensiun tidak tersedia")
    }

    const tmt = this.normalizeDate(tmtPensiun)

    const dpcp = new Date(tmt)
    dpcp.setFullYear(dpcp.getFullYear() - 2)

    const usulBkn = new Date(tmt)
    usulBkn.setFullYear(usulBkn.getFullYear() - 1)

    const sk = new Date(tmt)
    sk.setMonth(sk.getMonth() - 6)

    return {
      dpcp,
      usulBkn,
      sk
    }

  }

}