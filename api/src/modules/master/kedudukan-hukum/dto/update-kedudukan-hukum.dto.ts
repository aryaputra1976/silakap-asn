import { PartialType } from '@nestjs/mapped-types'
import { CreateKedudukanHukumDto } from './create-kedudukan-hukum.dto'

export class UpdateKedudukanHukumDto extends PartialType(
  CreateKedudukanHukumDto
) {}