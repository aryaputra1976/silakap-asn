export const workflowQueueKeys = {
  all: ["workflow-queue"] as const,

  list: (params: {
    page: number
    limit: number
    search?: string
    status?: string
    jenis?: string
  }) =>
    [
      ...workflowQueueKeys.all,
      "list",
      params.page,
      params.limit,
      params.search ?? null,
      params.status ?? null,
      params.jenis ?? null,
    ] as const,

  count: ["workflow-queue", "count"] as const,
}