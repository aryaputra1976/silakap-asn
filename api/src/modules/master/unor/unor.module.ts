import { Module } from '@nestjs/common'
import { UnorController } from './unor.controller'
import { UnorService } from './unor.service'
import { UnorRepository } from './unor.repository'

@Module({
  controllers: [UnorController],
  providers: [UnorService, UnorRepository],
  exports: [UnorService],
})
export class UnorModule {}