import http  from '@/core/http/httpClient'

export async function updateMyProfile(username: string) {
  const res = await http.patch('/users/me', { username })
  return res.data
}