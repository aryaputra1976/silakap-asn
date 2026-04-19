import { Module } from '@nestjs/common'
import { SiasnImportController } from './siasn-import.controller'
import { SiasnImportService } from './siasn-import.service'
import { PrismaService } from '../../prisma/prisma.service'

@Module({
  controllers: [SiasnImportController],
  providers: [SiasnImportService, PrismaService],
  exports: [SiasnImportService],
})
export class SiasnImportModule {}
