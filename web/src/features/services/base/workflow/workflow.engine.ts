import { workflowActions } from "./workflow.config"
import { rolePermissions, UserRole } from "./role.config"
import { ServiceStatus } from "../types/service.types"

export function getAvailableActions(
  status: ServiceStatus,
  role: UserRole
) {

  const statusActions = workflowActions[status] || []

  const roleActions = rolePermissions[role] || []

  if (roleActions.includes("all")) {
    return statusActions
  }

  return statusActions.filter((action) =>
    roleActions.includes(action)
  )

}