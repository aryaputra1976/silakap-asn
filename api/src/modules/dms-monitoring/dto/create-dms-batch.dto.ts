import { Transform } from 'class-transformer'
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator'

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null ? undefined : value

export class CreateDmsBatchDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  namaFile!: string

  @IsOptional()
  @Transform(emptyToUndefined)
  @Matches(/^\d+$/)
  unorId?: string

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(100)
  periodeLabel?: string

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(5000)
  catatan?: string
}
