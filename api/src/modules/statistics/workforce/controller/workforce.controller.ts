import { Controller, Get, Param, Query } from "@nestjs/common"
import { WorkforceService } from "../service/workforce.service"

@Controller("statistics/workforce")
export class WorkforceController {

  constructor(
    private service: WorkforceService
  ) {}

  @Get("dashboard")
  async dashboard(
    @Query("tahun") tahun: number
  ) {

    return this.service.dashboard(
      Number(tahun)
    )

  }

  @Get("all-opd")
  async allOpd(
    @Query("tahun") tahun: number
  ) {

    return this.service.calculateAllOpd(
      Number(tahun)
    )

  }

  @Get(":tahun/:unorId")
  async detail(

    @Param("tahun") tahun: number,
    @Param("unorId") unorId: number

  ) {

    return this.service.calculate(
      Number(unorId),
      Number(tahun)
    )

  }

}