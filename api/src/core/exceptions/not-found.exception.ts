import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class NotFoundException extends BaseException {
  constructor(message = 'Data not found', details?: any) {
    super(message, HttpStatus.NOT_FOUND, details);
  }
}
