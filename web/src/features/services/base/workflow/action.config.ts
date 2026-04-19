export interface WorkflowActionConfig {

  label: string

  variant: string

}

export const actionConfig: Record<string, WorkflowActionConfig> = {

  submit: {
    label: "Submit",
    variant: "primary",
  },

  verify: {
    label: "Verify",
    variant: "success",
  },

  approve: {
    label: "Approve",
    variant: "success",
  },

  reject: {
    label: "Reject",
    variant: "danger",
  },

  upload_sk: {
    label: "Upload SK",
    variant: "warning",
  },

}