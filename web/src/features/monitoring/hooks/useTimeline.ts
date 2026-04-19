import { useQuery } from '@tanstack/react-query'
import { getTimeline } from '../api/getTimeline.api'

export function useTimeline(layananId?: string) {
  return useQuery({
    queryKey: ['timeline', layananId],
    queryFn: () => getTimeline(layananId!),
    enabled: !!layananId,
  })
}