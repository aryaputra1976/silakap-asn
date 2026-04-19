import { useEffect, useState } from "react"
import http from "@/core/http/httpClient"

export interface UnorOption {

  id: string
  nama: string

}

export function useUnorOptions() {

  const [options, setOptions] = useState<UnorOption[]>([])

  useEffect(() => {

    const fetchData = async () => {

      try {

        const res = await http.get<UnorOption[]>("/ref/unor/level2")

        setOptions(res.data ?? [])

      } catch (err) {

        console.error("UNOR LOAD ERROR", err)

      }

    }

    fetchData()

  }, [])

  return { options }

}