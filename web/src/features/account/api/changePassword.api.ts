import http from '@/core/http/httpClient'
import { ChangePasswordRequest } from '../types'

export const changePassword = async (payload: ChangePasswordRequest) => {
  const { data } = await http.patch('/users/me/change-password', payload)
  return data
}