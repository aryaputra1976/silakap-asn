import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { createTracingSDK } from './tracing.sdk'

@Injectable()
export class TracingService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(TracingService.name)
  private sdk!: NodeSDK  // ✅ tambahkan !

  async onModuleInit() {
    this.logger.log('Starting OpenTelemetry...')
    this.sdk = await createTracingSDK()
    await this.sdk.start()
    this.logger.log('OpenTelemetry started')
  }

  async onModuleDestroy() {
    this.logger.log('Shutting down OpenTelemetry...')
    await this.sdk.shutdown()
    this.logger.log('OpenTelemetry shut down complete')
  }
}