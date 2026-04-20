import { Module } from '@nestjs/common'

import { DmsMonitoringAccessGuard } from './dms-monitoring-access.guard'
import { DmsMonitoringController } from './dms-monitoring.controller'
import { DmsMonitoringRepository } from './dms-monitoring.repository'
import { DmsMonitoringService } from './dms-monitoring.service'

@Module({
  controllers: [DmsMonitoringController],
  providers: [
    DmsMonitoringService,
    DmsMonitoringRepository,
    DmsMonitoringAccessGuard,
  ],
  exports: [DmsMonitoringService],
})
export class DmsMonitoringModule {}
