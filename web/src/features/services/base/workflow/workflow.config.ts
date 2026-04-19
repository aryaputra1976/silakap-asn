import { ServiceStatus } from "../types/service.types"

export const workflowActions: Record<ServiceStatus, string[]> = {

  DRAFT: ["submit"],

  SUBMITTED: ["verify", "reject"],

  VERIFIED: ["approve", "reject"],

  RETURNED: ["submit"],

  APPROVED: ["upload_sk"],

  REJECTED: [],

  SYNCED_SIASN: [],

  FAILED_SIASN: [],

  COMPLETED: [],

}
