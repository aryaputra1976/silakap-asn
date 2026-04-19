import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class RegisterPegawaiQueryDto {
  @ApiProperty({ example: '198765432109876543' })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.replace(/\s+/g, '').trim()
      : value,
  )
  @IsString()
  @MinLength(8)
  @MaxLength(30)
  nip!: string
}
