import { Module } from '@nestjs/common'
import { GolonganController } from './golongan.controller'
import { GolonganService } from './golongan.service'
import { GolonganRepository } from './golongan.repository'

@Module({
  controllers: [GolonganController],
  providers: [GolonganService, GolonganRepository],
  exports: [GolonganService],
})
export class GolonganModule {}