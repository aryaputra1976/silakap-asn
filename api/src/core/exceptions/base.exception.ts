import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus,
    details?: any,
  ) {
    super(
      {
        success: false,
        statusCode,
        message,
        details: details || null,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}
