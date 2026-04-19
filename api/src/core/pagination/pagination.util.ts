export function getPagination(query: any) {
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10
  const skip = (page - 1) * limit

  return { page, limit, skip }
}

export function buildMeta(page: number, limit: number, total: number) {
  return { page, limit, total }
}