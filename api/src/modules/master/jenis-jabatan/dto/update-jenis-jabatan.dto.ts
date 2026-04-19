import { PartialType } from '@nestjs/mapped-types'
import { CreateJenisJabatanDto } from './create-jenis-jabatan.dto'

export class UpdateJenisJabatanDto extends PartialType(
  CreateJenisJabatanDto
) {}