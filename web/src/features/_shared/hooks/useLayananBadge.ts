import { useEffect, useState } from "react"
import httpClient from "@/core/http/httpClient"

export function useLayananBadge() {
  const [count, setCount] = useState(0)

  const fetchBadge = async () => {
    try {
      const res = await httpClient.get("/layanan/badge")
      setCount(res.data?.count ?? 0)
    } catch {
      setCount(0)
    }
  }

  useEffect(() => {
    fetchBadge()

    const interval = setInterval(fetchBadge, 60000)
    return () => clearInterval(interval)
  }, [])

  return { count, refresh: fetchBadge }
}