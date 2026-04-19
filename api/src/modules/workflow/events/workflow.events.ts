export const WorkflowEvents = {

  STATE_CHANGED: "workflow.state.changed",

  SERVICE_CREATED: "workflow.service.created"

} as const

export type WorkflowEventType =
  typeof WorkflowEvents[keyof typeof WorkflowEvents]