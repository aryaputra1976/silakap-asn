import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'

export class RegisterDto {
  @ApiProperty({ example: 'Password123' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string

  @ApiProperty({ example: 'Password123' })
  @IsString()
  confirmPassword!: string

  @ApiPropertyOptional({ example: '198765432109876543' })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.replace(/\s+/g, '').trim()
      : value,
  )
  @IsString()
  @MinLength(8)
  @MaxLength(30)
  nip!: string

  @ApiProperty({ example: 'pegawai@bkpsdm.go.id' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsEmail({}, { message: 'Format email tidak valid' })
  @MaxLength(150)
  email!: string

  @ApiProperty({ example: '081234567890' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(8)
  @MaxLength(30)
  @Matches(/^[0-9+]+$/, {
    message: 'No. HP hanya boleh berisi angka dan tanda +',
  })
  noHp!: string
}
