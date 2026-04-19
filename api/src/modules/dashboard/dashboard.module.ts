import { Module } from "@nestjs/common"
import { PrismaModule } from "@/prisma/prisma.module"
import { EventsModule } from "@/core/events/events.module"
import { CacheModule } from "@/core/cache/cache.module"

import { DashboardService } from "./dashboard.service"
import { DashboardController } from "./dashboard.controller"
import { DashboardQuery } from "./queries/dashboard.query"

import { ActivityListener } from "./listeners/activity.listener"
import { NotificationListener } from "./listeners/notification.listener"
import { StatsListener } from "./listeners/stats.listener"

@Module({
  imports: [
    PrismaModule,
    EventsModule,
    CacheModule, // ⬅️ karena DashboardService pakai CacheService
  ],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    DashboardQuery, // ⬅️ WAJIB supaya bisa di-inject
    ActivityListener,
    NotificationListener,
    StatsListener,
  ],
})
export class DashboardModule {}