import { Type } from "class-transformer"
import { IsOptional, IsInt } from "class-validator"

export class QueryStatisticsDto {

  /**
   * Tahun statistik
   * contoh: ?tahun=2026
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tahun?: number

  /**
   * Filter unit organisasi
   * contoh: ?unorId=13
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  unorId?: number

}