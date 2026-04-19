import { ServiceStatus } from "../types/service.types"
import { UserRole } from "./role.config"
import { getAvailableActions } from "./workflow.engine"
import { actionConfig } from "./action.config"

interface Props {

  status: ServiceStatus

  role: UserRole

  onAction?: (action: string) => void

}

export default function WorkflowActions({
  status,
  role,
  onAction,
}: Props) {

  const actions = getAvailableActions(status, role)

  return (

    <div className="d-flex gap-2">

      {actions.map((action) => {

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