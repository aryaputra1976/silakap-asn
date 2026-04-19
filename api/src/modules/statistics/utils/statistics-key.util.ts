export function buildStatisticsKey(query: any) {

  if (!query.unorId) {
    return "statistics:asn:all"
  }

  return `statistics:asn:unor:${query.unorId}`

}