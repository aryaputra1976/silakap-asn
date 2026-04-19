import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'

export function handlePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new ConflictException('Data sudah ada')

      case 'P2025':
        throw new NotFoundException('Data tidak ditemukan')

      case 'P2003':
        throw new BadRequestException('Relasi data tidak valid')
    }
  }

  throw error
}