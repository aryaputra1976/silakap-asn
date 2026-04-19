import { Inject, Injectable } from '@nestjs/common'
import { Logger } from 'winston'

@Injectable()
export class SecurityLoggerService {
  constructor(
    @Inject('SECURITY_LOGGER')
    private readonly logger: Logger,
  ) {}

  log(message: string, meta?: any) {
    this.logger.info(message, meta)
  }
}