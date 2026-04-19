import { PartialType } from '@nestjs/mapped-types'
import { CreateStatusPerkawinanDto } from './create-status-perkawinan.dto'

export class UpdateStatusPerkawinanDto extends PartialType(
  CreateStatusPerkawinanDto
) {}