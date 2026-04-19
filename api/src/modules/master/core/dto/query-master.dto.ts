import { Transform, Type } from 'class-transformer'
import { IsIn, IsOptional, IsString, Min, Max } from 'class-validator'

export class QueryMasterDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page: number = 1

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit: number = 10

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  search?: string

  @IsOptional()
  @IsIn(['kode', 'nama', 'createdAt'])
  sort: 'kode' | 'nama' | 'createdAt' = 'kode'

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'asc'

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive'
}