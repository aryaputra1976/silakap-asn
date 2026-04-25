import { IsIn, IsOptional } from "class-validator"
import { QueryStatisticsDto } from "./query-statistics.dto"

export class QueryEmployeeReportExportDto extends QueryStatisticsDto {
  @IsOptional()
  @IsIn(["excel", "pdf"])
  format?: "excel" | "pdf"

  @IsOptional()
  @IsIn(["jenis-kelamin", "pendidikan", "golongan", "jabatan"])
  section?: "jenis-kelamin" | "pendidikan" | "golongan" | "jabatan"
}
