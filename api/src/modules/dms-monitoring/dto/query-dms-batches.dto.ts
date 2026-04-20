import { Transform, Type } from 'class-transformer'
import {
  IsOptional,
  Matches,
  Max,
  Min,
  IsIn,
} from 'class-validator'

import { DMS_IMPORT_STATUSES } from '../dms-monitoring.constants'

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null ? undefined : value

export class QueryDmsBatchesDto {
  @IsOptional()
  @Transform(emptyToUndefined)
  @Matches(/^\d+$/)
  unorId?: string

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsIn(DMS_IMPORT_STATUSES)
  status?: string

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
