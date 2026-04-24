import { WorkflowState, WorkflowAction } from "./types"

export const transitions: Record<WorkflowState, WorkflowAction[]> = {
  DRAFT: ["SUBMIT"],

  SUBMITTED: ["VERIFY", "RETURN"],

  IN_REVIEW: ["VERIFY", "RETURN"],

  VERIFIED: ["APPROVE", "REJECT"],

  RETURNED: ["SUBMIT"],

  APPROVED: ["SYNC_SIASN"],

  REJECTED: [],

  SYNCED_SIASN: [],

  FAILED_SIASN: ["RETRY_SIASN"],

  COMPLETED: [],
}
