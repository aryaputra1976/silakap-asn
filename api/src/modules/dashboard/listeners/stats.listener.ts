import { Injectable, OnModuleInit } from "@nestjs/common"
import { DomainEventBus } from "@/core/events/domain-event.bus"
import { DomainEvent } from "@/core/events/domain-event.interface"

@Injectable()
export class StatsListener implements OnModuleInit {
  constructor(private readonly bus: DomainEventBus) {}

  onModuleInit() {
    this.bus.subscribe("LAYANAN_DIBUAT", (e) => this.noop(e))
    this.bus.subscribe("LAYANAN_STATUS_BERUBAH", (e) => this.noop(e))
    this.bus.subscribe("LAYANAN_SELESAI", (e) => this.noop(e))
  }

  private async noop(_: DomainEvent) {
    // Placeholder for future materialized stats
  }
}