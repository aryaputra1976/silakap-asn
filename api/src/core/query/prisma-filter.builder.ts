export function buildPrismaWhere({
  filters,
  search,
  searchableFields,
}: {
  filters: Record<string, any>
  search?: string
  searchableFields: string[]
}) {
  const where: any = { deleted_at: null }

  // Structured filter
  Object.entries(filters).forEach(([field, value]) => {
    if (typeof value === 'object') {
      where[field] = {}
      Object.entries(value).forEach(([operator, val]) => {
        where[field][operator] = val
      })
    } else {
      where[field] = value
    }
  })

  // Search OR builder
  if (search && searchableFields.length) {
    where.OR = searchableFields.map((field) => ({
      [field]: { contains: search },
    }))
  }

  return where
}