import { PartialType } from '@nestjs/mapped-types'
import { CreateInstansiDto } from './create-instansi.dto'

export class UpdateInstansiDto extends PartialType(CreateInstansiDto) {}