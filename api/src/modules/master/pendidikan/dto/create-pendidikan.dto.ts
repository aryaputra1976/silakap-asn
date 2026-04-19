import { Transform, Type } from 'class-transformer'
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator'

export class CreatePendidikanDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value
  )
  kode!: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value
  )
  nama!: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tingkatId?: number
}