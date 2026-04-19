import { PartialType } from '@nestjs/mapped-types'
import { CreateJenisPensiunDto } from './create-jenis-pensiun.dto'

export class UpdateJenisPensiunDto extends PartialType(
  CreateJenisPensiunDto
) {}