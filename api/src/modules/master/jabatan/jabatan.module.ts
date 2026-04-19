import { Module } from '@nestjs/common'
import { JabatanController } from './jabatan.controller'
import { JabatanService } from './jabatan.service'
import { JabatanRepository } from './jabatan.repository'

@Module({
  controllers: [JabatanController],
  providers: [JabatanService, JabatanRepository],
  exports: [JabatanService],
})
export class JabatanModule {}