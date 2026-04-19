import { Module } from "@nestjs/common"

import { PrismaService } from "@/prisma/prisma.service"

import { StatisticsController } from "./statistics.controller"
import { StatisticsService } from "./statistics.service"

import { UnorTreeService } from "./services/unor-tree.service"
import { StatisticsCacheService } from "./services/statistics-cache.service"
import { StatisticsEngineService } from "./services/statistics-engine.service"

import { StatisticsRefreshWorker } from "./workers/statistics-refresh.worker"

@Module({
  imports: [],
  controllers: [StatisticsController],
  providers: [
    PrismaService,
    StatisticsService,
    UnorTreeService,
    StatisticsCacheService,
    StatisticsEngineService,
    StatisticsRefreshWorker
  ],
  exports: [StatisticsService]
})
export class StatisticsModule {}