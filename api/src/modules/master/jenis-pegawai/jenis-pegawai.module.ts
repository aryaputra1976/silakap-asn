import { Module } from '@nestjs/common'
import { JenisPegawaiController } from './jenis-pegawai.controller'
import { JenisPegawaiService } from './jenis-pegawai.service'
import { JenisPegawaiRepository } from './jenis-pegawai.repository'

@Module({
  controllers: [JenisPegawaiController],
  providers: [JenisPegawaiService, JenisPegawaiRepository],
  exports: [JenisPegawaiService],
})
export class JenisPegawaiModule {}