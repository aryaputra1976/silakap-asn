import { Controller, Get, Param, Query } from "@nestjs/common"
import { ApiTags, ApiOkResponse } from "@nestjs/swagger"

import { AsnService } from "./asn.service"
import { QueryAsnDto } from "./dto/query-asn.dto"
import { ParseBigIntPipe } from "@/core/pipes/parse-bigint.pipe"
import { AsnDetailDto } from "./dto/asn-detail.dto"

@ApiTags("ASN")
@Controller("asn")
export class AsnController {

  constructor(private service: AsnService) {}

  /* ================= LIST ================= */

  @Get()
  findAll(@Query() query: QueryAsnDto) {
    return this.service.findAll(query)
  }

  /* ================= STATS ================= */

  @Get("stats")
  getStats(
    @Query("unorId") unorId?: string
  ) {
    return this.service.getStats(unorId)
  }

  /* ================= DETAIL ================= */

  @Get(":id(\\d+)")
  @ApiOkResponse({ type: AsnDetailDto })
  findOne(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.service.findOne(id)
  }

}