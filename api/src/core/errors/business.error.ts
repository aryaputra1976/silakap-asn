export class BusinessError extends Error {
  code: string
  meta?: any

  constructor(code: string, message: string, meta?: any) {
    super(message)
    this.code = code
    this.meta = meta
  }
}