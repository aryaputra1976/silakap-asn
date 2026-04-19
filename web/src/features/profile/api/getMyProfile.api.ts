import http  from '@/core/http/httpClient'
import { MyProfile } from '../types'

export async function getMyProfile() {
  const res = await http.get<MyProfile>('/users/me')
  return res.data
}