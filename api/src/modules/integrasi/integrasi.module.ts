import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { IntegrasiImportController } from './import/integrasi-import.controller';
import { IntegrasiImportRepository } from './import/integrasi-import.repository';
import { IntegrasiImportService } from './import/integrasi-import.service';
import { IntegrasiJobsController } from './jobs/integrasi-jobs.controller';
import { IntegrasiJobsRepository } from './jobs/integrasi-jobs.repository';
import { IntegrasiJobsService } from './jobs/integrasi-jobs.service';
import { IntegrasiLogsController } from './logs/integrasi-logs.controller';
import { IntegrasiLogsRepository } from './logs/integrasi-logs.repository';
import { IntegrasiLogsService } from './logs/integrasi-logs.service';
import { IntegrasiSiasnController } from './siasn/integrasi-siasn.controller';
import { IntegrasiSiasnRepository } from './siasn/integrasi-siasn.repository';
import { IntegrasiSiasnService } from './siasn/integrasi-siasn.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    IntegrasiImportController,
    IntegrasiLogsController,
    IntegrasiJobsController,
    IntegrasiSiasnController,
  ],
  providers: [
    IntegrasiImportService,
    IntegrasiImportRepository,
    IntegrasiLogsService,
    IntegrasiLogsRepository,
    IntegrasiJobsService,
    IntegrasiJobsRepository,
    IntegrasiSiasnService,
    IntegrasiSiasnRepository,
  ],
})
export class IntegrasiModule {}