import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { INTEGRASI_IMPORT_STATUS_VALUES } from '../../import/integrasi-import-status.constant';

export const INTEGRASI_JOB_TYPE = {
  IMPORT_PEGAWAI: 'IMPORT_PEGAWAI',
} as const;

export const INTEGRASI_JOB_TYPE_VALUES = Object.values(INTEGRASI_JOB_TYPE);

export class QueryIntegrasiJobsDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  @IsIn(INTEGRASI_IMPORT_STATUS_VALUES)
  status?: string;

  @IsOptional()
  @IsString()
  @IsIn(INTEGRASI_JOB_TYPE_VALUES)
  type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}