import { ApiProperty } from '@nestjs/swagger'

export class MyProfileDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  username!: string

  @ApiProperty()
  isActive!: boolean

  @ApiProperty({ nullable: true })
  pegawaiId?: string

  @ApiProperty({ type: [String] })
  roles!: string[]

  @ApiProperty({ nullable: true })
  pegawai?: {
    id: string
    nama: string
    nip?: string
  }
}