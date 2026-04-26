import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateImportRowDto {
  @IsOptional()
  @IsString()
  nip?: string;

  @IsOptional()
  @IsString()
  nik?: string;

  @IsOptional()
  @IsString()
  nama?: string;

  @IsOptional()
  @IsString()
  siasnId?: string;

  @IsOptional()
  @IsObject()
  rawData?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  mappedData?: Record<string, unknown>;
}