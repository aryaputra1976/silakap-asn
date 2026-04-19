import { useEffect, useState } from "react"
import http from "@/core/http/httpClient"

export const useUnorChildren = (parentId?: number) => {

  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {

    setLoading(true)

    const params: any = {}

    if (parentId) params.parent_id = parentId

    const res = await http.get("/ref/unor/children", { params })

    setData(res.data)

    setLoading(false)

  }

  useEffect(() => {
    load()
  }, [parentId])

  return { data, loading }

}