import { Module } from '@nestjs/common'
import { MetricsService } from './metrics.service'
import { MetricsController } from './metrics.controller'
import { TracingService } from './tracing/tracing.service'

@Module({
  providers: [
    MetricsService,
    TracingService, // ✅ WAJIB
  ],
  controllers: [MetricsController],
  exports: [MetricsService],
})
export class ObservabilityModule {}