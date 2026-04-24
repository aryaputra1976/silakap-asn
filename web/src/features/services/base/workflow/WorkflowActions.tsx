import { ServiceStatus } from "../types/service.types"
import { UserRole } from "./role.config"
import { getAvailableActions } from "./workflow.engine"
import { actionConfig } from "./action.config"

interface Props {

  status: ServiceStatus

  role: UserRole

  actions?: string[]

  onAction?: (action: string) => void

}

export default function WorkflowActions({
  status,
  role,
  actions,
  onAction,
}: Props) {

  const availableActions =
    actions && actions.length > 0
      ? actions
      : getAvailableActions(status, role)

  return (

    <div className="d-flex gap-2">

      {availableActions.map((action) => {

        const config = actionConfig[action]

        if (!config) return null

        return (

          <button
            key={action}
            className={`btn btn-${config.variant}`}
            onClick={() => onAction?.(action)}
          >
            {config.label}
          </button>

        )

      })}

    </div>

  )

}
