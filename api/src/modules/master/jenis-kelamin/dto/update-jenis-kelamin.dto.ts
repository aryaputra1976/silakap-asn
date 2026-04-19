import { PartialType } from '@nestjs/mapped-types'
import { CreateJenisKelaminDto } from './create-jenis-kelamin.dto'

export class UpdateJenisKelaminDto extends PartialType(
  CreateJenisKelaminDto
) {}