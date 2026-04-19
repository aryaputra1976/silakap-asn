import { Transform } from 'class-transformer'
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
} from 'class-validator'

export class CreateJenisLayananDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value
  )
  kode!: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value
  )
  nama!: string

  @IsOptional()
  @IsString()
  deskripsi?: string
}