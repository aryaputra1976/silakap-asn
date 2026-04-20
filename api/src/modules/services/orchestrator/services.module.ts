import { Module } from '@nestjs/common'

import { ServicesController } from './controllers/services.controller'
import { LayananController } from './controllers/layanan.controller'
import { ServicesEngine } from './services.engine'

import { ServicesService } from './service/services.service'
import { ServicesSubmitService } from './service/services.submit.service'
import { ServicesWorkflowService } from './service/services.workflow.service'
import { ServicesQueryService } from './service/services.query.service'
import { ServicesDashboardService } from './service/services.dashboard.service'
import { ServicesDependencyService } from './service/services.dependency.service'
import { ServicesDocumentService } from './service/services.document.service'
import { ServicesWorkflowGuard } from './service/services.workflow.guard'
import { CompletenessService } from '../completeness/completeness.service'

@Module({
  controllers: [
    ServicesController,
    LayananController
  ],
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
      useValue: new CompletenessService()
    }
  ],
  exports: [
    ServicesService,
    ServicesEngine,
    ServicesQueryService,
    ServicesDashboardService,
    ServicesWorkflowService,
    ServicesDependencyService,
    ServicesWorkflowGuard
  ]
})
export class ServicesModule {}
