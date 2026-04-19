import { PipeTransform, Injectable } from '@nestjs/common';
import { ValidationException } from '../exceptions';

@Injectable()
export class ParseBoolPipe implements PipeTransform {
  transform(value: any) {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;

    throw new ValidationException("Parameter '" + value + "' harus berupa boolean");
  }
}
