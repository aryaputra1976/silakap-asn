import { PartialType } from '@nestjs/mapped-types'
import { CreateStatusKepegawaianDto } from './create-status-kepegawaian.dto'

export class UpdateStatusKepegawaianDto extends PartialType(
  CreateStatusKepegawaianDto
) {}