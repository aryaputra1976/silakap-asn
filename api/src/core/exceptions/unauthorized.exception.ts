import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class UnauthorizedException extends BaseException {
  constructor(message = 'Unauthorized', details?: any) {
    super(message, HttpStatus.UNAUTHORIZED, details);
  }
}
