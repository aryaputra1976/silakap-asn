import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class QueryImportBatchDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  q?: string;

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

export class QueryImportErrorsDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 25;
}

export class CreateMissingJabatanReferenceItemDto {
  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsString()
  @IsNotEmpty()
  idSiasn!: string;

  @IsString()
  @IsNotEmpty()
  kode!: string;

  @IsString()
  @IsNotEmpty()
  nama!: string;

  @IsOptional()
  @IsString()
  jenisJabatanId?: string;

  @IsOptional()
  @IsString()
  eselonId?: string;

  @IsOptional()
  @IsString()
  jenjang?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bup?: number;

  @IsOptional()
  @IsString()
  unorNama?: string;
}

export class CreateMissingJabatanReferencesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMissingJabatanReferenceItemDto)
  items!: CreateMissingJabatanReferenceItemDto[];
}

export class CreateMissingUnorReferenceItemDto {
  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsString()
  @IsNotEmpty()
  kode!: string;

  @IsOptional()
  @IsString()
  idSiasn?: string;

  @IsString()
  @IsNotEmpty()
  nama!: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  level?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  formasiIdeal?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class CreateMissingUnorReferencesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMissingUnorReferenceItemDto)
  items!: CreateMissingUnorReferenceItemDto[];
}

export class CreateMissingPendidikanReferenceItemDto {
  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsString()
  @IsNotEmpty()
  idSiasn!: string;

  @IsString()
  @IsNotEmpty()
  kode!: string;

  @IsString()
  @IsNotEmpty()
  nama!: string;

  @IsOptional()
  @IsString()
  tingkatId?: string;
}

export class CreateMissingPendidikanReferencesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMissingPendidikanReferenceItemDto)
  items!: CreateMissingPendidikanReferenceItemDto[];
}