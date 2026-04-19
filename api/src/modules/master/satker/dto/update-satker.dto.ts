import { PartialType } from '@nestjs/mapped-types'
import { CreateSatkerDto } from './create-satker.dto'

export class UpdateSatkerDto extends PartialType(
  CreateSatkerDto
) {}