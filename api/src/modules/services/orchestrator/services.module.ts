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
import { ServicesWorkflowGuard } from './service/services.workflow.guard'
import { ServicesWorkflowService } from './service/services.workflow.service'

@Module({
  controllers: [ServicesController, LayananController],
  providers: [
    CompletenessService,
    ServicesService,
    ServicesEngine,
    ServicesWorkflowService,
    ServicesQueryService,
    ServicesDashboardService,
    ServicesDependencyService,
    ServicesDocumentService,
    ServicesWorkflowGuard,
  ],
  exports: [
    CompletenessService,
    ServicesService,
    ServicesEngine,
    ServicesQueryService,
    ServicesDashboardService,
    ServicesWorkflowService,
    ServicesDependencyService,
    ServicesWorkflowGuard,
  ],
})
export class ServicesModule {}