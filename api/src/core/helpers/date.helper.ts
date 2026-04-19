export class DateHelper {
  static toISO(date: Date = new Date()): string {
    return date.toISOString();
  }

  static now(): string {
    return new Date().toISOString();
  }

  static addDays(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  }
}
