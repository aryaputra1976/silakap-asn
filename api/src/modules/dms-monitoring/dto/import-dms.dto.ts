import { Transform } from 'class-transformer'
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator'

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null ? undefined : value

export class ImportDmsDto {
  @IsOptional()
  @Transform(emptyToUndefined)
  @Matches(/^\d+$/)
  batchId?: string

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
