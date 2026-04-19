export type WorkflowState =
  | "DRAFT"
  | "SUBMITTED"
  | "VERIFIED"
  | "RETURNED"
  | "APPROVED"
  | "REJECTED"
  | "SYNCED_SIASN"
  | "FAILED_SIASN"

export type WorkflowAction =
  | "SUBMIT"
  | "VERIFY"
  | "RETURN"
  | "APPROVE"
  | "REJECT"
  | "SYNC_SIASN"
  | "RETRY_SIASN"