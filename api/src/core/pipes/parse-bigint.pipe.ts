import { PipeTransform, BadRequestException } from '@nestjs/common'

export class ParseBigIntPipe implements PipeTransform<string, bigint> {
  transform(value: string): bigint {
    if (!value) {
      throw new BadRequestException('ID tidak boleh kosong')
    }

    if (!/^\d+$/.test(value)) {
      throw new BadRequestException('ID harus berupa angka')
    }

    try {
      return BigInt(value)
    } catch {
      throw new BadRequestException('Format BigInt tidak valid')
    }
  }
}