import { Transform, Type } from 'class-transformer'
import {
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator'

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null ? undefined : value

export class QueryDmsSnapshotsDto {
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
  kategori?: string

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(100)
  nip?: string

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number
}
