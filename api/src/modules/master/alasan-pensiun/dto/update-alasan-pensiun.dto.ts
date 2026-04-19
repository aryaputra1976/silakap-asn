import { PartialType } from '@nestjs/mapped-types'
import { CreateAlasanPensiunDto } from './create-alasan-pensiun.dto'

export class UpdateAlasanPensiunDto extends PartialType(
  CreateAlasanPensiunDto
) {}