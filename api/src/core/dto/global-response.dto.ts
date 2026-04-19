import { ApiProperty } from '@nestjs/swagger';

export class GlobalResponseDto<T> {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({
    example: '2026-02-12T04:00:00.000Z',
    description: 'Waktu server saat response dikirim',
  })
  timestamp!: string;

  @ApiProperty({ example: '/api/v1/pegawai' })
  path!: string;

  @ApiProperty({ example: 'GET' })
  method!: string;

  @ApiProperty({
    description: 'Data utama dari response',
  })
  data!: T;
}
