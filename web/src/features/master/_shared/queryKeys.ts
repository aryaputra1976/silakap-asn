export const masterKeys = {
  all: ["master"] as const,

  lists: (endpoint: string) =>
    [...masterKeys.all, endpoint] as const,

  list: (endpoint: string, params: unknown) =>
    [...masterKeys.lists(endpoint), params] as const,
}