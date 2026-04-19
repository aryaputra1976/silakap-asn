import { Injectable } from "@nestjs/common"
import { AsnRepository } from "./asn.repository"
import { QueryAsnDto } from "./dto/query-asn.dto"
import { AsnDetailDto } from "./dto/asn-detail.dto"
import { NotFoundException } from "@/core/exceptions"
import { AsnMapper } from "./mapper/asn.mapper"
import { AsnListDto } from "./dto/asn-list.dto"

@Injectable()
export class AsnService {

  constructor(private repo: AsnRepository) {}

  async findAll(query: QueryAsnDto) {

    const result = await this.repo.findAll(query)

    return {
      ...result,
      data: result.data.map(AsnMapper.toList) as AsnListDto[],
    }

  }

  async findOne(id: bigint): Promise<AsnDetailDto> {

    const asn = await this.repo.findById(id)

    if (!asn) {
      throw new NotFoundException("ASN tidak ditemukan")
    }

    return AsnMapper.toDetail(asn)

  }

  async getStats(unorId?: string) {
    return this.repo.getStats(unorId)
  }
}