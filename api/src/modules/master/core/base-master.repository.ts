import { Prisma, PrismaClient } from '@prisma/client'
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
  private fieldNameCache?: Set<string>

  constructor(protected readonly prisma: PrismaService) {}

  protected abstract getModelName(): keyof PrismaClient
  protected abstract getAllowedSortFields(): string[]

  protected getClient(tx?: TxClient) {
    return tx ?? this.prisma
  }

  protected getModel(client: PrismaClient | TxClient) {
    return (client as any)[this.getModelName()]
  }

  protected getModelPascalName(): string {
    const modelName = String(this.getModelName())
    return modelName.charAt(0).toUpperCase() + modelName.slice(1)
  }

  protected getModelFieldNames(): Set<string> {
    if (this.fieldNameCache) return this.fieldNameCache

    const model = Prisma.dmmf.datamodel.models.find(
      (entry) => entry.name === this.getModelPascalName()
    )

    this.fieldNameCache = new Set(
      (model?.fields ?? []).map((field) => field.name)
    )

    return this.fieldNameCache
  }

  protected hasField(fieldName: string): boolean {
    return this.getModelFieldNames().has(fieldName)
  }

  protected sanitizeData<T extends Record<string, unknown>>(data: T) {
    return Object.fromEntries(
      Object.entries(data).filter(
        ([key, value]) => this.hasField(key) && value !== undefined
      )
    )
  }

  protected buildLocalIdSiasn(seed?: string): string {
    const modelPart = this.getModelPascalName()
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase()

    const seedPart = (seed ?? Date.now().toString())
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase()
      .slice(0, 32)

    return `LOCAL-${modelPart}-${seedPart}-${Date.now()}`.slice(
      0,
      100
    )
  }

  // ================= LIST =================
  async findMany(query?: QueryDto): Promise<PaginatedResult<Entity>> {
    const page = Math.max(query?.page ?? 1, 1)
    const limit = Math.min(Math.max(query?.limit ?? 10, 1), 100)

    const skip = (page - 1) * limit
    const take = limit

    const where: any = { deletedAt: null }

    const trimmedSearch = query?.search?.trim()

    if (trimmedSearch) {
      where.OR = [
        { kode: { contains: trimmedSearch } },
        { nama: { contains: trimmedSearch } },
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
    const createData: Record<string, unknown> = {
      ...this.sanitizeData(dto),
    }

    if (this.hasField('idSiasn') && !createData.idSiasn) {
      createData.idSiasn = this.buildLocalIdSiasn(
        String(dto?.kode ?? dto?.nama ?? '')
      )
    }

    return model.create({ data: createData })
  }

  // ================= UPDATE =================
  async update(id: bigint, dto: any, tx: TxClient): Promise<Entity> {
    const model = this.getModel(this.getClient(tx))

    const existing = await model.findFirst({
      where: { id, deletedAt: null },
    })

    if (!existing) throw new Error('Record not found')

    const updateData = this.sanitizeData(dto)

    return model.update({
      where: { id },
      data: updateData,
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

    const deleteData = this.sanitizeData({
      deletedAt: new Date(),
      updatedBy: userId ?? undefined,
    })

    await model.update({
      where: { id },
      data: deleteData,
    })
  }

  // ================= RESTORE =================
  async restore(id: bigint, tx: TxClient): Promise<Entity | null> {
    const model = this.getModel(this.getClient(tx))

    const existing = await model.findFirst({
      where: { id, deletedAt: { not: null } },
    })

    if (!existing) return null

    const restoreData = this.sanitizeData({
      deletedAt: null,
    })

    return model.update({
      where: { id },
      data: restoreData,
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

    const toggleData = this.sanitizeData({
      isActive: !existing.isActive,
      updatedBy: userId ?? undefined,
    })

    return model.update({
      where: { id },
      data: toggleData,
    })
  }
}
