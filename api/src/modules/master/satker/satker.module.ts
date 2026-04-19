import { Module } from '@nestjs/common'
import { SatkerController } from './satker.controller'
import { SatkerService } from './satker.service'
import { SatkerRepository } from './satker.repository'

@Module({
  controllers: [SatkerController],
  providers: [SatkerService, SatkerRepository],
  exports: [SatkerService],
})
export class SatkerModule {}