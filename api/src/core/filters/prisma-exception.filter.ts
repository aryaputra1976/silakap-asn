import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    let message = 'Database error'
    let statusCode = HttpStatus.BAD_REQUEST

    switch (exception.code) {
      case 'P2002': {
        const target = (exception.meta as any)?.target

        message = Array.isArray(target)
          ? `Duplicate value for field: ${target.join(', ')}`
          : 'Duplicate entry'

        statusCode = HttpStatus.BAD_REQUEST
        break
      }

      case 'P2025':
        message = 'Record not found'
        statusCode = HttpStatus.NOT_FOUND
        break

      case 'P2003':
        message = 'Data is still referenced by other records'
        statusCode = HttpStatus.BAD_REQUEST
        break

      default:
        message = 'Unexpected database error'
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    })
  }
}