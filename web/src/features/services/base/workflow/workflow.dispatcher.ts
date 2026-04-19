import { dispatchWorkflowAction } from "../api/service.api"

export async function workflowDispatcher(
  service: string,
  id: string,
  action: string
) {

  return dispatchWorkflowAction(service, id, action)

}
