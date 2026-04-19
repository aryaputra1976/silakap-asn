import { WorkforceGapEngine } from "./engine/workforce-gap.engine"

export class WorkforceEngine {

  private gapEngine = new WorkforceGapEngine()

  calculate(
    unorId: number,
    workloadRows: any[],
    asnEksisting: number
  ) {

    return this.gapEngine.calculate(
      workloadRows,
      asnEksisting
    )

  }

}