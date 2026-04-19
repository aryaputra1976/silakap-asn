export class PensiunReminderEngine {

  private static normalizeDate(date: Date): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    )
  }

  static diffTahun(
    target: Date,
    today: Date
  ): number {

    const t = this.normalizeDate(target)
    const now = this.normalizeDate(today)

    return (
      t.getFullYear() -
      now.getFullYear()
    )

  }

  static isReminder2Tahun(
    tmtPensiun: Date,
    today: Date
  ): boolean {

    return this.diffTahun(
      tmtPensiun,
      today
    ) === 2

  }

  static isReminder1Tahun(
    tmtPensiun: Date,
    today: Date
  ): boolean {

    return this.diffTahun(
      tmtPensiun,
      today
    ) === 1

  }

  static isReminder6Bulan(
    tmtPensiun: Date,
    today: Date
  ): boolean {

    const target = this.normalizeDate(tmtPensiun)
    const now = this.normalizeDate(today)

    const diffMs =
      target.getTime() -
      now.getTime()

    if (diffMs <= 0) {
      return false
    }

    const diffBulan =
      diffMs / (1000 * 60 * 60 * 24 * 30)

    return diffBulan <= 6

  }

}