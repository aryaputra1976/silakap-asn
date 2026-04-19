import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { BaseMasterService } from '@/core/master/base-master.service'
import {
  __PASCAL__Repository,
  __PASCAL__Entity,
} from './__KEBAB__.repository'
import { Create__PASCAL__Dto } from './dto/create-__KEBAB__.dto'
import { Update__PASCAL__Dto } from './dto/update-__KEBAB__.dto'
import { Query__PASCAL__Dto } from './dto/query-__KEBAB__.dto'

@Injectable()
export class __PASCAL__Service extends BaseMasterService<
  __PASCAL__Entity,
  Create__PASCAL__Dto,
  Update__PASCAL__Dto,
  Query__PASCAL__Dto
> {
  constructor(
    protected readonly repo: __PASCAL__Repository,
    protected readonly prisma: PrismaService
  ) {
    super(repo, prisma, '__TABLE__')
  }

  protected async beforeDeleteTx(tx: any, id: bigint): Promise<void> {
__RELATION_CHECK__
  }
}