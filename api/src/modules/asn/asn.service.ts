import { Injectable } from "@nestjs/common"
import { AsnRepository } from "./asn.repository"
import { QueryAsnDto } from "./dto/query-asn.dto"
import { AsnDetailDto } from "./dto/asn-detail.dto"
import { NotFoundException } from "@/core/exceptions"
import { AsnMapper } from "./mapper/asn.mapper"
import { AsnListDto } from "./dto/asn-list.dto"
import { AuthenticatedUser } from "@/modules/auth/strategies/jwt.strategy"
import { PrismaService } from "@/prisma/prisma.service"

@Injectable()
export class AsnService {

  constructor(
    private repo: AsnRepository,
    private prisma: PrismaService,
  ) {}

  private isOperator(user: AuthenticatedUser | null | undefined) {
    return Boolean(user?.roles?.includes("OPERATOR"))
  }

  private async resolveOperatorScopeUnorId(
    user: AuthenticatedUser | null | undefined,
  ): Promise<string | null> {
    if (!this.isOperator(user)) {
      return null
    }

    const unitKerjaId = user?.unitKerjaId

    if (!unitKerjaId) {
      return null
    }

    let current = await this.prisma.refUnor.findUnique({
      where: { id: BigInt(unitKerjaId) },
      select: {
        id: true,
        level: true,
        parentId: true,
      },
    })

    while (current) {
      if (current.level === 2) {
        return current.id.toString()
      }

      if (!current.parentId) {
        break
      }

      current = await this.prisma.refUnor.findUnique({
        where: { id: current.parentId },
        select: {
          id: true,
          level: true,
          parentId: true,
        },
      })
    }

    return unitKerjaId
  }

  async findAll(user: AuthenticatedUser, query: QueryAsnDto) {
    const scopedUnorId = await this.resolveOperatorScopeUnorId(user)

    if (this.isOperator(user) && !scopedUnorId) {
      return {
        data: [],
        meta: {
          total: 0,
          page: Number(query.page ?? 1),
          limit: Number(query.limit ?? 20),
        },
      }
    }

    const result = await this.repo.findAll(
      {
        ...query,
        unorId: scopedUnorId ?? query.unorId,
      },
    )

    return {
      ...result,
      data: result.data.map(AsnMapper.toList) as AsnListDto[],
    }

  }

  async findOne(
    user: AuthenticatedUser,
    id: bigint,
  ): Promise<AsnDetailDto> {
    const scopedUnorId = await this.resolveOperatorScopeUnorId(user)

    if (this.isOperator(user) && !scopedUnorId) {
      throw new NotFoundException("ASN tidak ditemukan")
    }

    const asn = await this.repo.findById(id, scopedUnorId ?? undefined)

    if (!asn) {
      throw new NotFoundException("ASN tidak ditemukan")
    }

    return AsnMapper.toDetail(asn)

  }

  async getStats(
    user: AuthenticatedUser,
    unorId?: string,
  ) {
    const scopedUnorId = await this.resolveOperatorScopeUnorId(user)

    if (this.isOperator(user) && !scopedUnorId) {
      return {
        total: 0,
        pns: 0,
        pppk: 0,
        pppkParuhWaktu: 0,
      }
    }

    return this.repo.getStats(scopedUnorId ?? unorId)
  }
}
