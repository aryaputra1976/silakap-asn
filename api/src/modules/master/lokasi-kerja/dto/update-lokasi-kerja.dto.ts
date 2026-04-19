import { PartialType } from '@nestjs/mapped-types'
import { CreateLokasiKerjaDto } from './create-lokasi-kerja.dto'

export class UpdateLokasiKerjaDto extends PartialType(
  CreateLokasiKerjaDto
) {}