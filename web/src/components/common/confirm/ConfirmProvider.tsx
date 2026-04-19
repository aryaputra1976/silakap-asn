import { createContext, useCallback, useContext, useState } from "react"
import { ConfirmDialog } from "./ConfirmDialog"

type ConfirmOptions = {
  title?: string
  message?: React.ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
}

type ConfirmContextType = {
  confirm: (options: ConfirmOptions) => void
}

const ConfirmContext = createContext<ConfirmContextType | null>(null)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [loading, setLoading] = useState(false)

  const close = () => {
    if (!loading) setOptions(null)
  }

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts)
  }, [])

  const handleConfirm = async () => {
    if (!options) return

    try {
      setLoading(true)
      await options.onConfirm()
      setOptions(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      <ConfirmDialog
        open={!!options}
        title={options?.title}
        message={options?.message}
        confirmText={options?.confirmText}
        cancelText={options?.cancelText}
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={close}
      />
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider")
  return ctx.confirm
}