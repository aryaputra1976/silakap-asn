import { Transform, Type } from 'class-transformer'
import { IsIn, IsOptional, IsString, Min, Max } from 'class-validator'

export class Query__PASCAL__Dto {
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
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : undefined
  )
  search?: string

  @IsOptional()
  @IsIn(['kode', 'nama'])
  sort: 'kode' | 'nama' = 'kode'
}
