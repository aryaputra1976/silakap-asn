import { Module } from "@nestjs/common"

import { AsnController } from "./asn.controller"
import { AsnService } from "./asn.service"
import { AsnRepository } from "./asn.repository"

@Module({
  controllers: [AsnController],
  providers: [AsnService, AsnRepository],
})
export class AsnModule {}