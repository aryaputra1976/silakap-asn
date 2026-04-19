import { PrismaClient } from '@prisma/client'
import { PrismaService } from '@/prisma/prisma.service'

export type TxClient =
  Parameters<PrismaClient['$transaction']>[0] extends (
    arg: infer T
  ) => any
    ? T
    : never

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type PaginatedResult<T> = {
  data: T[]
  meta: PaginationMeta
}

export type MasterEntity = {
  id: bigint
  deletedAt?: Date | null
  isActive?: boolean
  kode?: string
  nama?: string
}

export abstract class BaseMasterRepository<
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
  constructor(protected readonly prisma: PrismaService) {}

  protected abstract getModelName(): keyof PrismaClient
  protected abstract getAllowedSortFields(): string[]

  protected getClient(tx?: TxClient) {
    return tx ?? this.prisma
  }

  protected getModel(client: PrismaClient | TxClient) {
    return (client as any)[this.getModelName()]
  }

  // ================= LIST =================
  async findMany(query?: QueryDto): Promise<PaginatedResult<Entity>> {
    const page = Math.max(query?.page ?? 1, 1)
    const limit = Math.min(Math.max(query?.limit ?? 10, 1), 100)

    const skip = (page - 1) * limit
    const take = limit

    const where: any = { deletedAt: null }

    if (query?.search) {
      where.OR = [
        { kode: { contains: query.search, mode: 'insensitive' } },
        { nama: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    if (query?.status === 'active') where.isActive = true
    if (query?.status === 'inactive') where.isActive = false

    const allowed = this.getAllowedSortFields()

    const sortField =
      query?.sort && allowed.includes(query.sort)
        ? query.sort
        : 'id'

    const orderBy = {
      [sortField]: query?.order ?? 'asc',
    }

    const model = this.getModel(this.prisma)

    const [data, total] = await Promise.all([
      model.findMany({ where, skip, take, orderBy }),
      model.count({ where }),
    ])

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // ================= DETAIL =================
  async findById(id: bigint, tx?: TxClient): Promise<Entity | null> {
    const model = this.getModel(this.getClient(tx))

    return model.findFirst({
      where: { id, deletedAt: null },
    })
  }

  // ================= CREATE =================
  async create(dto: any, tx: TxClient): Promise<Entity> {
    const model = this.getModel(this.getClient(tx))
    return model.create({ data: dto })
  }

  // ================= UPDATE =================
  async update(id: bigint, dto: any, tx: TxClient): Promise<Entity> {
    const model = this.getModel(this.getClient(tx))

    const existing = await model.findFirst({
      where: { id, deletedAt: null },
    })

    if (!existing) throw new Error('Record not found')

    return model.update({
      where: { id },
      data: dto,
    })
  }

  // ================= SOFT DELETE =================
  async softDelete(
    id: bigint,
    userId: bigint | undefined,
    tx: TxClient
  ): Promise<void> {
    const model = this.getModel(this.getClient(tx))

    const existing = await model.findFirst({
      where: { id, deletedAt: null },
    })

    if (!existing) throw new Error('Record not found')

    await model.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId ?? undefined,
      },
    })
  }

  // ================= RESTORE =================
  async restore(id: bigint, tx: TxClient): Promise<Entity | null> {
    const model = this.getModel(this.getClient(tx))

    const existing = await model.findFirst({
      where: { id, deletedAt: { not: null } },
    })

    if (!existing) return null

    return model.update({
      where: { id },
      data: { deletedAt: null },
    })
  }

  // ================= TOGGLE ACTIVE =================
  async toggleActive(
    id: bigint,
    userId: bigint | undefined,
    tx: TxClient
  ): Promise<Entity> {
    const model = this.getModel(this.getClient(tx))

    const existing = await model.findFirst({
      where: { id, deletedAt: null },
    })

    if (!existing) throw new Error('Record not found')

    return model.update({
      where: { id },
      data: {
        isActive: !existing.isActive,
        updatedBy: userId ?? undefined,
      },
    })
  }
}