import { Transform } from 'class-transformer'
import { IsBoolean } from 'class-validator'

export class ToggleUserStatusDto {
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') return value.trim().toLowerCase() === 'true'
    return value
  })
  @IsBoolean()
  isActive!: boolean
}
