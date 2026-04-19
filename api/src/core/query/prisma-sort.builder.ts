export function buildPrismaOrder(sort?: {
  field: string
  direction: 'asc' | 'desc'
}) {
  if (!sort) return { id: 'asc' }

  return {
    [sort.field]: sort.direction,
  }
}