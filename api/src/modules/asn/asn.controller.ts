import { Controller, Get, Param, Query } from "@nestjs/common"
import { ApiTags, ApiOkResponse } from "@nestjs/swagger"

import { AsnService } from "./asn.service"
import { QueryAsnDto } from "./dto/query-asn.dto"
import { ParseBigIntPipe } from "@/core/pipes/parse-bigint.pipe"
import { AsnDetailDto } from "./dto/asn-detail.dto"
import { CurrentUser } from "@/core/decorators/current-user.decorator"
import { AuthenticatedUser } from "@/modules/auth/strategies/jwt.strategy"

@ApiTags("ASN")
@Controller("asn")
export class AsnController {

  constructor(private service: AsnService) {}

  /* ================= LIST ================= */

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryAsnDto,
  ) {
    return this.service.findAll(user, query)
  }

  /* ================= STATS ================= */

  @Get("stats")
  getStats(
    @CurrentUser() user: AuthenticatedUser,
    @Query("unorId") unorId?: string
  ) {
    return this.service.getStats(user, unorId)
  }

  /* ================= DETAIL ================= */

  @Get(":id(\\d+)")
  @ApiOkResponse({ type: AsnDetailDto })
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseBigIntPipe) id: bigint,
  ) {
    return this.service.findOne(user, id)
  }

  /* ================= RIWAYAT JABATAN ================= */

  @Get(":id(\\d+)/jabatan")
  getRiwayatJabatan(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.service.getRiwayatJabatan(id)
  }

  /* ================= RIWAYAT PANGKAT ================= */

  @Get(":id(\\d+)/pangkat")
  getRiwayatPangkat(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.service.getRiwayatPangkat(id)
  }

  /* ================= RIWAYAT PENDIDIKAN ================= */

  @Get(":id(\\d+)/pendidikan")
  getRiwayatPendidikan(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.service.getRiwayatPendidikan(id)
  }

  /* ================= RIWAYAT DIKLAT ================= */

  @Get(":id(\\d+)/diklat")
  getRiwayatDiklat(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.service.getRiwayatDiklat(id)
  }

  /* ================= RIWAYAT KELUARGA ================= */

  @Get(":id(\\d+)/keluarga")
  getRiwayatKeluarga(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.service.getRiwayatKeluarga(id)
  }

}
