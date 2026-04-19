import { Module } from '@nestjs/common'

import { ServicesController } from './controllers/services.controller'
import { LayananController } from './controllers/layanan.controller'

import { ServicesService } from './service/services.service'
import { ServicesSubmitService } from './service/services.submit.service'
import { ServicesWorkflowService } from './service/services.workflow.service'
import { ServicesQueryService } from './service/services.query.service'
import { ServicesDashboardService } from './service/services.dashboard.service'
import { ServicesDependencyService } from './service/services.dependency.service'
import { ServicesDocumentService } from './service/services.document.service'

@Module({
  controllers: [
    ServicesController,
    LayananController
  ],
  providers: [
    ServicesService,
    ServicesSubmitService,
    ServicesWorkflowService,
    ServicesQueryService,
    ServicesDashboardService,
    ServicesDependencyService,
    ServicesDocumentService
  ],
  exports: [
    ServicesService
  ]
})
export class ServicesModule {}
