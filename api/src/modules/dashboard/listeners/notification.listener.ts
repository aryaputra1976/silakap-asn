import { Injectable, OnModuleInit } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"
import { DomainEventBus } from "@/core/events/domain-event.bus"
import { DomainEvent } from "@/core/events/domain-event.interface"
import { CacheService } from "@/core/cache/cache.service"

@Injectable()
export class NotificationListener implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bus: DomainEventBus,
    private readonly cache: CacheService,
  ) {}

  onModuleInit() {
    this.bus.subscribe("LAYANAN_STATUS_BERUBAH", (e) => this.handle(e))
    this.bus.subscribe("DOKUMEN_DITOLAK", (e) => this.handle(e))
    this.bus.subscribe("LAYANAN_SELESAI", (e) => this.handle(e))
  }

  private async handle(event: DomainEvent) {
    const payload = (event.payload ?? {}) as {
      targetUserId?: string
      title?: string
      message?: string
    }
    const targetUserId = payload?.targetUserId
    if (!targetUserId) return

    await this.prisma.silakapNotification.create({
      data: {
        userId: BigInt(targetUserId),
        title: payload?.title ?? "Notifikasi Layanan",
        message: payload?.message ?? event.eventType,
      },
    })

    await this.cache.del(`dashboard:summary:${targetUserId}`)
  }
}