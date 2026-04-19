import { PartialType } from '@nestjs/mapped-types'
import { CreateJenisLayananDto } from './create-jenis-layanan.dto'

export class UpdateJenisLayananDto extends PartialType(
  CreateJenisLayananDto
) {}