import { Module } from '@nestjs/common'
import { StatusPerkawinanController } from './status-perkawinan.controller'
import { StatusPerkawinanService } from './status-perkawinan.service'
import { StatusPerkawinanRepository } from './status-perkawinan.repository'

@Module({
  controllers: [StatusPerkawinanController],
  providers: [StatusPerkawinanService, StatusPerkawinanRepository],
  exports: [StatusPerkawinanService],
})
export class StatusPerkawinanModule {}