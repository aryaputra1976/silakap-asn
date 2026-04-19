import { LayananStatus } from "@prisma/client"

/**
 * Input workflow
 */
export interface WorkflowActionInput {

  usulId: bigint

  pegawaiId: bigint

  jenisLayananId: bigint

  actorRoleId?: bigint

  currentStatus: LayananStatus

  nextStatus: LayananStatus

}

/**
 * Workflow event
 */
export interface WorkflowStateChangedEvent {

  usulId: bigint

  jenisLayananId: bigint

  fromStatus: LayananStatus

  toStatus: LayananStatus

  actorRoleId?: bigint

}

/**
 * Timeline record
 */
export interface WorkflowTimelineRecord {

  usulId: bigint

  fromStatus: LayananStatus

  toStatus: LayananStatus

  actorRoleId?: bigint

  createdAt?: Date

}

/**
 * Workflow transition rule
 */
export interface WorkflowTransitionRule {

  jenisLayananId: bigint

  fromState: LayananStatus

  toState: LayananStatus

  role?: string

}

/**
 * Workflow dependency rule
 */
export interface WorkflowDependencyRule {

  parentJenisLayananId: bigint

  childJenisLayananId: bigint

  triggerStatus: LayananStatus

  blockingStatus: LayananStatus

  autoCreate: boolean

  condition?: Record<string, any>

}

/**
 * SLA config
 */
export interface WorkflowSLAConfig {

  jenisLayananId: bigint

  state: LayananStatus

  durationMinutes: number

}

/**
 * SLA instance
 */
export interface WorkflowSLAInstance {

  usulId: bigint

  state: LayananStatus

  startedAt: Date

  dueAt: Date

  finishedAt?: Date

  isBreached?: boolean

}