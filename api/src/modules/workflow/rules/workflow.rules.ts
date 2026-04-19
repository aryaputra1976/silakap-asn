import { LayananStatus } from "@prisma/client"

/**
 * Fallback workflow rules
 * Digunakan jika rule belum tersedia di database
 */
export const WorkflowRules: Record<
  LayananStatus,
  LayananStatus[]
> = {

  DRAFT: [
    LayananStatus.SUBMITTED
  ],

  SUBMITTED: [
    LayananStatus.VERIFIED,
    LayananStatus.RETURNED,
    LayananStatus.REJECTED
  ],

  VERIFIED: [
    LayananStatus.APPROVED,
    LayananStatus.RETURNED
  ],

  RETURNED: [
    LayananStatus.SUBMITTED
  ],

  APPROVED: [
    LayananStatus.SYNCED_SIASN,
    LayananStatus.FAILED_SIASN
  ],

  REJECTED: [],

  SYNCED_SIASN: [],

  FAILED_SIASN: [
    LayananStatus.SYNCED_SIASN
  ]

}