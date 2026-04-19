import { PartialType } from '@nestjs/mapped-types'
import { CreateUnorDto } from './create-unor.dto'

export class UpdateUnorDto extends PartialType(CreateUnorDto) {}