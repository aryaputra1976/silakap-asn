export const asnQueryKeys = {
  all: ["asn"] as const,
  list: (params?: any) => [...asnQueryKeys.all, "list", params] as const,
  detail: (id: bigint) => [...asnQueryKeys.all, "detail", id] as const,
}