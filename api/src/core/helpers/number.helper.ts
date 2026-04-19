export class NumberHelper {
  static toNumber(value: any): number {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }

  static isNumeric(value: any): boolean {
    return !isNaN(Number(value));
  }
}
