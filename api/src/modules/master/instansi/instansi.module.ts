import { Module } from '@nestjs/common'
import { InstansiController } from './instansi.controller'
import { InstansiService } from './instansi.service'
import { InstansiRepository } from './instansi.repository'

@Module({
  controllers: [InstansiController],
  providers: [InstansiService, InstansiRepository],
  exports: [InstansiService],
})
export class InstansiModule {}