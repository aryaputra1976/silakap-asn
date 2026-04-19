export type ParsedQuery = {
  page: number
  limit: number
  search?: string
  sort?: { field: string; direction: 'asc' | 'desc' }
  filters: Record<string, any>
}

export function parseQuery(raw: any): ParsedQuery {
  const page = Number(raw.page ?? 1)
  const limit = Number(raw.limit ?? 10)

  let sort: ParsedQuery['sort']
  if (raw.sort) {
    const [field, direction] = raw.sort.split(':')

    const dir: 'asc' | 'desc' = direction === 'desc' ? 'desc' : 'asc'

    sort = {
      field: String(field),
      direction: dir,
    }
  }

  const filters: Record<string, any> = {}

  if (raw.filter) {
    Object.keys(raw.filter).forEach((key) => {
      filters[key] = raw.filter[key]
    })
  }

  return {
    page,
    limit,
    search: raw.search,
    sort,
    filters,
  }
}