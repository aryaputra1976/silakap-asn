import http  from '@/core/http/httpClient'

export async function changePassword(data: {
  oldPassword: string
  newPassword: string
}) {
  const res = await http.patch(
    '/users/me/change-password',
    data
  )
  return res.data
}