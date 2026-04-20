import { Module } from '@nestjs/common'

import { DmsMonitoringController } from './dms-monitoring.controller'
import { DmsMonitoringRepository } from './dms-monitoring.repository'
import { DmsMonitoringService } from './dms-monitoring.service'

@Module({
  controllers: [DmsMonitoringController],
  providers: [DmsMonitoringService, DmsMonitoringRepository],
  exports: [DmsMonitoringService],
})
export class DmsMonitoringModule {}
