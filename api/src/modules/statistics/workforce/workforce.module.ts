import { Module } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"

import { WorkforceController } from "./controller/workforce.controller"
import { WorkforceService } from "./service/workforce.service"

@Module({

  controllers: [
    WorkforceController
  ],

  providers: [
    WorkforceService,
    PrismaService
  ]

})

export class WorkforceModule {}