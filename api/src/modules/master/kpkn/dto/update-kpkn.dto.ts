import { PartialType } from '@nestjs/mapped-types'
import { CreateKpknDto } from './create-kpkn.dto'

export class UpdateKpknDto extends PartialType(CreateKpknDto) {}