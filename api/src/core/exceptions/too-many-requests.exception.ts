import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class TooManyRequestsException extends BaseException {
  constructor(message = 'Too many requests', details?: any) {
    super(message, HttpStatus.TOO_MANY_REQUESTS, details);
  }
}
