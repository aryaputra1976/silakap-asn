import { Matches } from 'class-validator'

export class DmsIdParamDto {
  @Matches(/^\d+$/)
  id!: string
}
