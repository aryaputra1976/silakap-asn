import { Toaster } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          borderRadius: '8px',
          fontSize: '13px',
        },
        success: { duration: 3000 },
        error: { duration: 5000 },
      }}
    />
  )
}