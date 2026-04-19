import { useMutation } from '@tanstack/react-query'
import { changePassword } from '../api/changePassword.api'
import { showApiError } from '@/core/http/httpToast'
import toast from 'react-hot-toast'

export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Password berhasil diubah')
    },
    onError: (err: any) => {
      showApiError(err.message)
    },
  })
}