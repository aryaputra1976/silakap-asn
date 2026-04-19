import { Module } from '@nestjs/common'
import { LokasiKerjaController } from './lokasi-kerja.controller'
import { LokasiKerjaService } from './lokasi-kerja.service'
import { LokasiKerjaRepository } from './lokasi-kerja.repository'

@Module({
  controllers: [LokasiKerjaController],
  providers: [LokasiKerjaService, LokasiKerjaRepository],
  exports: [LokasiKerjaService],
})
export class LokasiKerjaModule {}