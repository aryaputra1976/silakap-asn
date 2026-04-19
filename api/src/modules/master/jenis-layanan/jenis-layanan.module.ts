import { Module } from '@nestjs/common'
import { JenisLayananController } from './jenis-layanan.controller'
import { JenisLayananService } from './jenis-layanan.service'
import { JenisLayananRepository } from './jenis-layanan.repository'

@Module({
  controllers: [JenisLayananController],
  providers: [JenisLayananService, JenisLayananRepository],
  exports: [JenisLayananService],
})
export class JenisLayananModule {}