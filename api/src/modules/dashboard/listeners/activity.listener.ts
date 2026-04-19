import { Injectable, OnModuleInit } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"
import { DomainEventBus } from "@/core/events/domain-event.bus"
import { DomainEvent } from "@/core/events/domain-event.interface"

@Injectable()
export class ActivityListener implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bus: DomainEventBus,
  ) {}

  onModuleInit() {
    this.bus.subscribe("LAYANAN_DIBUAT", (e) => this.handle(e))
    this.bus.subscribe("LAYANAN_STATUS_BERUBAH", (e) => this.handle(e))
    this.bus.subscribe("LAYANAN_SELESAI", (e) => this.handle(e))
    this.bus.subscribe("DOKUMEN_DITOLAK", (e) => this.handle(e))
  }

  private async handle(event: DomainEvent) {
    const payload = (event.payload ?? {}) as {
      userId?: string
      title?: string
      description?: string
    }

    await this.prisma.silakapActivity.create({
      data: {
        userId: payload?.userId ? BigInt(payload.userId) : null,
        title: payload?.title ?? event.eventType,
        description: payload?.description ?? null,
      },
    })
  }
}