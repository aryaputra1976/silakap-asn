import { api } from '@/services/api'
import type { TimelineItem } from '../types'

export async function getTimeline(
  layananId: string
): Promise<TimelineItem[]> {
  const { data } = await api.get(`/layanan/${layananId}/timeline`)
  return data
}