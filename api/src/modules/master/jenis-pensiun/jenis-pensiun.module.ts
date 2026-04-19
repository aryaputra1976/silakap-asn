import { Module } from '@nestjs/common'
import { JenisPensiunController } from './jenis-pensiun.controller'
import { JenisPensiunService } from './jenis-pensiun.service'
import { JenisPensiunRepository } from './jenis-pensiun.repository'

@Module({
  controllers: [JenisPensiunController],
  providers: [JenisPensiunService, JenisPensiunRepository],
  exports: [JenisPensiunService],
})
export class JenisPensiunModule {}