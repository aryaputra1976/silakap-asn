import { ApiProperty } from "@nestjs/swagger"

export class AsnDetailDto {

  @ApiProperty()
  id!: bigint

  @ApiProperty()
  nip!: string

  @ApiProperty()
  nama!: string

  @ApiProperty({
    enum: ["PNS", "PPPK", "PPPK_PARUH_WAKTU"],
    nullable: true,
    required: false,
  })
  statusAsn?: string | null

  @ApiProperty({ nullable: true, required: false })
  tempatLahir?: string | null

  @ApiProperty({ nullable: true, required: false })
  tanggalLahir?: Date | null

  @ApiProperty({ nullable: true, required: false })
  jenisKelamin?: string | null

  @ApiProperty({ nullable: true, required: false })
  agama?: string | null

  @ApiProperty({ nullable: true, required: false })
  statusPerkawinan?: string | null

  @ApiProperty({ nullable: true, required: false })
  jabatan?: string | null

  @ApiProperty({ nullable: true, required: false })
  golongan?: string | null

  @ApiProperty({ nullable: true, required: false })
  unitKerja?: string | null

}