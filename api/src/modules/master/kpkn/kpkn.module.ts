import { Module } from '@nestjs/common'
import { KpknController } from './kpkn.controller'
import { KpknService } from './kpkn.service'
import { KpknRepository } from './kpkn.repository'

@Module({
  controllers: [KpknController],
  providers: [KpknService, KpknRepository],
  exports: [KpknService],
})
export class KpknModule {}