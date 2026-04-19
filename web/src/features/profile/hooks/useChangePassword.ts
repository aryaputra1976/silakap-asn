import { useMutation } from '@tanstack/react-query'
import { changePassword } from '../api/changePassword.api'
import { useToast } from '@/core/toast/toast.hook'

export function useChangePassword() {
  const toast = useToast()

  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Password berhasil diubah')
    },
  })
}