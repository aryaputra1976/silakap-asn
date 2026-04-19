import { ApiPropertyOptional } from "@nestjs/swagger"
import {
  IsOptional,
  IsInt,
  IsString,
  Min,
  Max
} from "class-validator"
import { Type, Transform } from "class-transformer"

export class QueryAsnDto {

  /* PAGE */

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1

  /* LIMIT */

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20

  /* SEARCH */

  @ApiPropertyOptional({ description: "Cari berdasarkan NIP atau Nama" })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  search?: string

  /* STATUS */

  @ApiPropertyOptional({ description: "Filter status ASN" })
  @IsOptional()
  @IsString()
  status?: string

  /* JABATAN */

  @ApiPropertyOptional({ description: "Filter jenis jabatan" })
  @IsOptional()
  @IsString()
  jenisJabatanId?: string

  /* UNIT */

  @ApiPropertyOptional({ description: "Filter unit organisasi" })
  @IsOptional()
  @IsString()
  unorId?: string

}