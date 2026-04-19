import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '@/prisma/prisma.service'
import {
  BaseMasterRepository,
  PaginatedResult,
  MasterEntity,
} from './base-master.repository'

export abstract class BaseMasterService<
  Entity extends MasterEntity,
  CreateDto,
  UpdateDto,
  QueryDto extends {
    page?: number
    limit?: number
    search?: string
    sort?: string
    order?: 'asc' | 'desc'
    status?: 'active' | 'inactive'
  }
> {
  constructor(
    protected readonly repo: BaseMasterRepository<
      Entity,
      CreateDto,
      UpdateDto,
      QueryDto
    >,
    protected readonly prisma: PrismaService
  ) {}

  protected async beforeCreateTx(
    tx: any,
    dto: CreateDto
  ): Promise<void> {}

  protected async beforeUpdateTx(
    tx: any,
    id: bigint,
    dto: UpdateDto
  ): Promise<void> {}

  protected async beforeDeleteTx(
    tx: any,
    id: bigint
  ): Promise<void> {}

  async getList(query?: QueryDto): Promise<PaginatedResult<Entity>> {
    return this.repo.findMany(query)
  }

  async getById(id: bigint): Promise<Entity> {
    const data = await this.repo.findById(id)
    if (!data) throw new NotFoundException('Data not found')
    return data
  }

  async create(dto: CreateDto, userId?: bigint): Promise<Entity> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await this.beforeCreateTx(tx, dto)

        return this.repo.create(
          { ...dto, createdBy: userId ?? undefined },
          tx
        )
      })
    } catch (error: any) {
      this.handlePrismaError(error)
      throw error
    }
  }

  async update(
    id: bigint,
    dto: UpdateDto,
    userId?: bigint
  ): Promise<Entity> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const existing = await this.repo.findById(id, tx)
        if (!existing) throw new NotFoundException('Data not found')

        await this.beforeUpdateTx(tx, id, dto)

        const sanitizedDto: any = { ...dto }
        delete sanitizedDto.kode

        return this.repo.update(
          id,
          { ...sanitizedDto, updatedBy: userId ?? undefined },
          tx
        )
      })
    } catch (error: any) {
      this.handlePrismaError(error)
      throw error
    }
  }

  async remove(id: bigint, userId?: bigint): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const existing = await this.repo.findById(id, tx)
        if (!existing) throw new NotFoundException('Data not found')

        await this.beforeDeleteTx(tx, id)

        await this.repo.softDelete(id, userId, tx)
      })
    } catch (error: any) {
      this.handlePrismaError(error)
      throw error
    }
  }

  async restore(id: bigint): Promise<Entity> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const restored = await this.repo.restore(id, tx)

        if (!restored)
          throw new NotFoundException(
            'Data not found or not deleted'
          )

        return restored
      })
    } catch (error: any) {
      this.handlePrismaError(error)
      throw error
    }
  }

  async toggleActive(
    id: bigint,
    userId?: bigint
  ): Promise<Entity> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const existing = await this.repo.findById(id, tx)
        if (!existing) throw new NotFoundException('Data not found')

        return this.repo.toggleActive(id, userId, tx)
      })
    } catch (error: any) {
      this.handlePrismaError(error)
      throw error
    }
  }

  protected handlePrismaError(error: any): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new BadRequestException(
            'Data sudah ada (duplicate)'
          )
        case 'P2003':
          throw new BadRequestException(
            'Data masih direferensikan'
          )
        case 'P2025':
          throw new NotFoundException('Data tidak ditemukan')
      }
    }
    throw error
  }
}