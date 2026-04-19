import { Module } from '@nestjs/common'
import { AlasanPensiunController } from './alasan-pensiun.controller'
import { AlasanPensiunService } from './alasan-pensiun.service'
import { AlasanPensiunRepository } from './alasan-pensiun.repository'

@Module({
  controllers: [AlasanPensiunController],
  providers: [AlasanPensiunService, AlasanPensiunRepository],
  exports: [AlasanPensiunService],
})
export class AlasanPensiunModule {}