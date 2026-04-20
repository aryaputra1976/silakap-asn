import { Controller, Get, Param, Query, ParseIntPipe } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import { Public } from "@/core/decorators/public.decorator"
import { RefUnorService } from "./ref-unor.service"

@ApiTags("REF UNOR")
@Controller("ref/unor")
export class RefUnorController {

  constructor(private readonly service: RefUnorService) {}

  /* ================= DROPDOWN ================= */

  @Public()
  @Get("level2")
  findLevel2() {
    return this.service.findLevel2()
  }

  @Public()
  @Get("register-options")
  findRegisterOptions() {
    return this.service.findRegisterOptions()
  }

  /* ================= FULL TREE ================= */

  @Get("tree")
  getTree() {
    return this.service.getTree()
  }

  /* ================= TREE + ASN COUNT ================= */

  @Get("tree-count")
  getTreeWithCount() {
    return this.service.getTreeWithCount()
  }

  /* ================= LAZY TREE ================= */

  @Get("children")
  getChildren(
    @Query("parent_id") parentId?: string
  ) {

    if (!parentId) {
      return this.service.getRoot()
    }

    return this.service.getChildren(Number(parentId))

  }

  /* ================= SEARCH ================= */

  @Get("search")
  search(
    @Query("q") q: string
  ) {
    return this.service.search(q)
  }
  /* ================= DETAIL ================= */

  @Get(":id")
  findById(
    @Param("id", ParseIntPipe) id: number
  ) {
    return this.service.findById(id)
  }

  /* ================= UNIT STATS ================= */

  @Get(":id/stats")
  getStats(
    @Param("id", ParseIntPipe) id: number
  ) {
    return this.service.getStats(id)
  }

  /* ================= BREADCRUMB ================= */

  @Get(":id/breadcrumb")
  getBreadcrumb(
    @Param("id", ParseIntPipe) id: number
  ) {
    return this.service.getBreadcrumb(id)
  }


}
