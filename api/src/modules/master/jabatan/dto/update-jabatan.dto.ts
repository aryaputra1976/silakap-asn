import { PartialType } from '@nestjs/mapped-types'
import { CreateJabatanDto } from './create-jabatan.dto'

export class UpdateJabatanDto extends PartialType(
  CreateJabatanDto
) {}