import { useEffect, useState } from "react"
import http from "@/core/http/httpClient"
import { useAuthStore } from "@/stores/auth.store"

type BreadcrumbNode = {
  id: string | number
  nama: string
  parentId?: string | number | null
}

type OperatorOpdScope = {
  isOperatorScoped: boolean
  unorId?: number
  unorName?: string
  loading: boolean
}

export function useOperatorOpdScope(): OperatorOpdScope {
  const user = useAuthStore((state) => state.user)
  const [scope, setScope] = useState<OperatorOpdScope>({
    isOperatorScoped: false,
    loading: false,
  })

  useEffect(() => {
    const unitKerjaId = user?.unitKerjaId
    const isOperatorScoped =
      Boolean(unitKerjaId) && user?.roles?.includes("OPERATOR")

    if (!isOperatorScoped || !unitKerjaId) {
      setScope({
        isOperatorScoped: false,
        loading: false,
      })
      return
    }

    let active = true

    async function loadScope() {
      setScope({
        isOperatorScoped: true,
        loading: true,
      })

      try {
        const response = await http.get<BreadcrumbNode[]>(
          `/ref/unor/${unitKerjaId}/breadcrumb`,
        )

        if (!active) return

        const path = response.data ?? []
        const opdNode =
          path.length >= 2 ? path[1] : path[path.length - 1]

        setScope({
          isOperatorScoped: true,
          unorId: opdNode ? Number(opdNode.id) : Number(unitKerjaId),
          unorName: opdNode?.nama ?? undefined,
          loading: false,
        })
      } catch {
        if (!active) return

        setScope({
          isOperatorScoped: true,
          unorId: Number(unitKerjaId),
          unorName: undefined,
          loading: false,
        })
      }
    }

    void loadScope()

    return () => {
      active = false
    }
  }, [user?.roles, user?.unitKerjaId])

  return scope
}
