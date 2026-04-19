import { PipeTransform, Injectable } from '@nestjs/common';
import { ValidationException } from '../exceptions';

@Injectable()
export class ParseIntPipe implements PipeTransform {
  transform(value: any) {
    const val = Number(value);

    if (isNaN(val)) {
      throw new ValidationException(`Parameter '${value}' harus berupa angka`);
    }

    return val;
  }
}
