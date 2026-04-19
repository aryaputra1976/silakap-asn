import { Module } from '@nestjs/common'
import { StatusKepegawaianController } from './status-kepegawaian.controller'
import { StatusKepegawaianService } from './status-kepegawaian.service'
import { StatusKepegawaianRepository } from './status-kepegawaian.repository'

@Module({
  controllers: [StatusKepegawaianController],
  providers: [StatusKepegawaianService, StatusKepegawaianRepository],
  exports: [StatusKepegawaianService],
})
export class StatusKepegawaianModule {}