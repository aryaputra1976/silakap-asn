import { ReactNode, useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { LoadingScreen } from "@/components/common/LoadingScreen"


interface Props {
  children: ReactNode
}

/**
 * Auth bootstrap provider
 * - restore session dari storage
 * - (nanti) refresh token
 */
export function AuthProvider({ children }: Props) {
  
  const initialize = useAuthStore((s) => s.initialize)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const run = async () => {
      await initialize()
      setReady(true)
    }
    run()
  }, [initialize])

  if (!ready) {
    return <LoadingScreen />
  }

  return <>{children}</>
}