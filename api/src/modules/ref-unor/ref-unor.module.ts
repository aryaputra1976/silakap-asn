import { Module } from "@nestjs/common"
import { RefUnorController } from "./ref-unor.controller"
import { RefUnorService } from "./ref-unor.service"
import { RefUnorRepository } from "./ref-unor.repository"

@Module({
  controllers: [RefUnorController],
  providers: [
    RefUnorService,
    RefUnorRepository
  ],
  exports: [RefUnorService]
})
export class RefUnorModule {}