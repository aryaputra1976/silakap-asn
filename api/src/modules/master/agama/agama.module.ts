import { Module } from '@nestjs/common'
import { AgamaController } from './agama.controller'
import { AgamaService } from './agama.service'
import { AgamaRepository } from './agama.repository'

@Module({
  controllers: [AgamaController],
  providers: [AgamaService, AgamaRepository],
  exports: [AgamaService],
})
export class AgamaModule {}