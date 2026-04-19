import { Injectable, OnModuleInit } from "@nestjs/common"
import { StatisticsCacheService } from "../services/statistics-cache.service"

@Injectable()
export class StatisticsRefreshWorker implements OnModuleInit {

  constructor(private cache: StatisticsCacheService) {}

  onModuleInit() {

    setInterval(() => {
      this.cache.clear()
    }, 5 * 60 * 1000)

  }

}