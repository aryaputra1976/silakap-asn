import { Module } from '@nestjs/common'
import { KedudukanHukumController } from './kedudukan-hukum.controller'
import { KedudukanHukumService } from './kedudukan-hukum.service'
import { KedudukanHukumRepository } from './kedudukan-hukum.repository'

@Module({
  controllers: [KedudukanHukumController],
  providers: [KedudukanHukumService, KedudukanHukumRepository],
  exports: [KedudukanHukumService],
})
export class KedudukanHukumModule {}