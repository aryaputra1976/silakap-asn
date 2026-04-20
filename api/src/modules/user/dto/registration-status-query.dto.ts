import { Transform } from 'class-transformer'
import { IsIn, IsOptional } from 'class-validator'

const REGISTRATION_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
] as const

export class RegistrationStatusQueryDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toUpperCase()
      : value,
  )
  @IsIn(REGISTRATION_STATUSES)
  status?: (typeof REGISTRATION_STATUSES)[number]
}
