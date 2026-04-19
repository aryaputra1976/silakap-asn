import { ApiProperty } from "@nestjs/swagger"

export class AsnListDto {

  @ApiProperty()
  id!: bigint

  @ApiProperty()
  nip!: string

  @ApiProperty()
  nama!: string

  @ApiProperty({ nullable: true })
  statusAsn?: string | null

  @ApiProperty({ nullable: true })
  jabatan?: string | null

  @ApiProperty({ nullable: true })
  golongan?: string | null

  @ApiProperty({ nullable: true })
  unitKerja?: string | null

}