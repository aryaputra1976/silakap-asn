import { Module } from '@nestjs/common'
import { TempatLahirController } from './tempat-lahir.controller'
import { TempatLahirService } from './tempat-lahir.service'
import { TempatLahirRepository } from './tempat-lahir.repository'

@Module({
  controllers: [TempatLahirController],
  providers: [TempatLahirService, TempatLahirRepository],
  exports: [TempatLahirService],
})
export class TempatLahirModule {}