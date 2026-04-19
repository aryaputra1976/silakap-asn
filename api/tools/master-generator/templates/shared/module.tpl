import { Module } from '@nestjs/common'
import { __PASCAL__Controller } from './__KEBAB__.controller'
import { __PASCAL__Service } from './__KEBAB__.service'
import { __PASCAL__Repository } from './__KEBAB__.repository'

@Module({
  controllers: [__PASCAL__Controller],
  providers: [__PASCAL__Service, __PASCAL__Repository],
})
export class __PASCAL__Module {}