import { Transform } from 'class-transformer'
import { IsOptional, Matches } from 'class-validator'

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null ? undefined : value

export class QueryDmsDashboardDto {
  @IsOptional()
  @Transform(emptyToUndefined)
  @Matches(/^\d+$/)
  unorId?: string
}
