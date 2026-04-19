import { ReactNode, useEffect } from "react"
import { createPortal } from "react-dom"
import { useToastStore } from "./toast.store"

type Props = { children: ReactNode }

export function ToastProvider({ children }: Props) {
  const toasts = useToastStore((s) => s.toasts)
  const remove = useToastStore((s) => s.remove)

  useEffect(() => {
    const timers = toasts.map((t) =>
      setTimeout(() => remove(t.id), t.duration ?? 4000)
    )
    return () => timers.forEach(clearTimeout)
  }, [toasts, remove])

  return (
    <>
      {children}

      {createPortal(
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 999999 }}>
          {toasts.map((t) => (
            <div
              key={t.id}
              style={{
                marginBottom: 8,
                padding: "12px 16px",
                borderRadius: 8,
                color: "#fff",
                background:
                  t.type === "success"
                    ? "#16a34a"
                    : t.type === "error"
                    ? "#dc2626"
                    : t.type === "warning"
                    ? "#f59e0b"
                    : "#2563eb",
              }}
            >
              {t.message}
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}