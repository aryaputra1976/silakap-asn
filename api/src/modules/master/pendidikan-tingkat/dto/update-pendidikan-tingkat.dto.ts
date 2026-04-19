import { PartialType } from '@nestjs/mapped-types'
import { CreatePendidikanTingkatDto } from './create-pendidikan-tingkat.dto'

export class UpdatePendidikanTingkatDto extends PartialType(
  CreatePendidikanTingkatDto
) {}