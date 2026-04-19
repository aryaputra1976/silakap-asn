export interface WorkflowDuration {

  usulId: bigint

  state: string

  startedAt: Date

  finishedAt?: Date

  durationMinutes: number

}

export interface SLAComplianceStats {

  total: number

  breached: number

  compliant: number

  complianceRate: number

}