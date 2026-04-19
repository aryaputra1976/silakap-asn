import { PartialType } from '@nestjs/mapped-types'
import { CreateJenisPegawaiDto } from './create-jenis-pegawai.dto'

export class UpdateJenisPegawaiDto extends PartialType(
  CreateJenisPegawaiDto
) {}