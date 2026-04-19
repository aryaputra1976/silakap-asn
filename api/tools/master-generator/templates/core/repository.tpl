import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import {
  BaseMasterRepository,
  MasterEntity,
} from '@/core/master/base-master.repository'
import { Create__PASCAL__Dto } from './dto/create-__KEBAB__.dto'
import { Update__PASCAL__Dto } from './dto/update-__KEBAB__.dto'
import { Query__PASCAL__Dto } from './dto/query-__KEBAB__.dto'

export type __PASCAL__Entity = MasterEntity & {}

@Injectable()
export class __PASCAL__Repository extends BaseMasterRepository<
  __PASCAL__Entity,
  Create__PASCAL__Dto,
  Update__PASCAL__Dto,
  Query__PASCAL__Dto
> {
  constructor(prisma: PrismaService) {
    super(prisma)
  }

  protected getModelName(): '__TABLE__' {
    return '__TABLE__'
  }

  extractKode() {
    return undefined
  }
}