import { Module } from '@nestjs/common'

import { CompletenessService } from '../completeness/completeness.service'

import { LayananController } from './controllers/layanan.controller'
import { ServicesController } from './controllers/services.controller'
import { ServicesEngine } from './services.engine'
import { ServicesDashboardService } from './service/services.dashboard.service'
import { ServicesDependencyService } from './service/services.dependency.service'
import { ServicesDocumentService } from './service/services.document.service'
import { ServicesQueryService } from './service/services.query.service'
import { ServicesService } from './service/services.service'
import { ServicesSubmitService } from './service/services.submit.service'
import { ServicesWorkflowGuard } from './service/services.workflow.guard'
import { ServicesWorkflowService } from './service/services.workflow.service'

@Module({
  controllers: [ServicesController, LayananController],
  providers: [
    ServicesService,
    ServicesEngine,
    ServicesSubmitService,
    ServicesWorkflowService,
    ServicesQueryService,
    ServicesDashboardService,
    ServicesDependencyService,
    ServicesDocumentService,
    ServicesWorkflowGuard,
    {
      provide: CompletenessService,
      useClass: CompletenessService,
    },
  ],
  exports: [
    ServicesService,
    ServicesEngine,
    ServicesQueryService,
    ServicesDashboardService,
    ServicesWorkflowService,
    ServicesDependencyService,
    ServicesWorkflowGuard,
    CompletenessService,
  ],
})
export class ServicesModule {}
