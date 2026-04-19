import { ApiProperty } from "@nestjs/swagger"

export class AsnStatsDto {

  @ApiProperty()
  total!: number

  @ApiProperty()
  pns!: number

  @ApiProperty()
  pppk!: number

  @ApiProperty()
  pppkParuhWaktu!: number

}