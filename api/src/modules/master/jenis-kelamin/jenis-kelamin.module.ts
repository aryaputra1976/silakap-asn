import { Module } from '@nestjs/common'
import { JenisKelaminController } from './jenis-kelamin.controller'
import { JenisKelaminService } from './jenis-kelamin.service'
import { JenisKelaminRepository } from './jenis-kelamin.repository'

@Module({
  controllers: [JenisKelaminController],
  providers: [JenisKelaminService, JenisKelaminRepository],
  exports: [JenisKelaminService],
})
export class JenisKelaminModule {}