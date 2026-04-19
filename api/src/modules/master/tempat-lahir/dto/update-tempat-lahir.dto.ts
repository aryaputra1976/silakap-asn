import { PartialType } from '@nestjs/mapped-types'
import { CreateTempatLahirDto } from './create-tempat-lahir.dto'

export class UpdateTempatLahirDto extends PartialType(
  CreateTempatLahirDto
) {}