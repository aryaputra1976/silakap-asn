import { Module } from '@nestjs/common'
import { JenisJabatanController } from './jenis-jabatan.controller'
import { JenisJabatanService } from './jenis-jabatan.service'
import { JenisJabatanRepository } from './jenis-jabatan.repository'

@Module({
  controllers: [JenisJabatanController],
  providers: [JenisJabatanService, JenisJabatanRepository],
  exports: [JenisJabatanService],
})
export class JenisJabatanModule {}