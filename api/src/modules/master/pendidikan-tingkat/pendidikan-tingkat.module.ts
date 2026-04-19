import { Module } from '@nestjs/common'
import { PendidikanTingkatController } from './pendidikan-tingkat.controller'
import { PendidikanTingkatService } from './pendidikan-tingkat.service'
import { PendidikanTingkatRepository } from './pendidikan-tingkat.repository'

@Module({
  controllers: [PendidikanTingkatController],
  providers: [PendidikanTingkatService, PendidikanTingkatRepository],
  exports: [PendidikanTingkatService],
})
export class PendidikanTingkatModule {}