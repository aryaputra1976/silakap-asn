import { Transform, Type } from 'class-transformer'
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator'

export class CreateJabatanDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value
  )
  kode!: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value
  )
  nama!: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  jenisJabatanId?: number
}