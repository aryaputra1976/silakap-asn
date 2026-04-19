import { Module } from '@nestjs/common'
import { PendidikanController } from './pendidikan.controller'
import { PendidikanService } from './pendidikan.service'
import { PendidikanRepository } from './pendidikan.repository'

@Module({
  controllers: [PendidikanController],
  providers: [PendidikanService, PendidikanRepository],
  exports: [PendidikanService],
})
export class PendidikanModule {}