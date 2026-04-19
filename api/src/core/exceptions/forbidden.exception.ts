import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class ForbiddenException extends BaseException {
  constructor(message = 'Forbidden', details?: any) {
    super(message, HttpStatus.FORBIDDEN, details);
  }
}
