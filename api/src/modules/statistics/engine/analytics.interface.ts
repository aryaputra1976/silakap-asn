export interface StatisticsAnalytics {

  key: string

  run(
    prisma: any,
    where: any
  ): Promise<any>

}