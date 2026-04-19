import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class ConflictException extends BaseException {
  constructor(message = 'Conflict', details?: any) {
    super(message, HttpStatus.CONFLICT, details);
  }
}
