// web/src/features/profil-asn/hooks/useAsnList.ts
import { useEffect, useMemo, useState } from "react"
import http from "@/core/http/httpClient"

export interface AsnItem {
  id: number
  nama: string
  nip: string
  statusAsn: string
  golongan?: string
  jabatan?: string
  unitKerja?: string
}

export interface UseAsnListParams {
  search?: string
  status?: string
  jenisJabatanId?: string
  unorId?: string | number | null
  page?: number
}

type AsnListResponse = {
  data?: AsnItem[]
  meta?: {
    total?: number
    limit?: number
  }
}

type AsnListQuery = {
  search?: string
  status?: string
  jenisJabatanId?: string
  unorId?: string | number
  page?: number
}

export function useAsnList(params: UseAsnListParams) {
  const [data, setData] = useState<AsnItem[]>([])
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(20)
  const [loading, setLoading] = useState(false)

  const trimmedSearch = useMemo(() => {
    return (params.search ?? "").trim()
  }, [params.search])

  useEffect(() => {
    let active = true

    const fetchData = async () => {
      const query: AsnListQuery = {}

      if (trimmedSearch !== "") {
        query.search = trimmedSearch
      }

      if (params.status) {
        query.status = params.status
      }

      if (params.jenisJabatanId) {
        query.jenisJabatanId = params.jenisJabatanId
      }

      if (params.unorId !== undefined && params.unorId !== null && params.unorId !== "") {
        query.unorId = params.unorId
      }

      if (params.page) {
        query.page = params.page
      }

      setLoading(true)

      try {
        const res = await http.get<AsnListResponse>("/asn", {
          params: query,
        })

        if (!active) {
          return
        }

        setData(res.data.data ?? [])
        setTotal(res.data.meta?.total ?? 0)
        setLimit(res.data.meta?.limit ?? 20)
      } catch (error) {
        if (!active) {
          return
        }

        console.error("ASN LOAD ERROR", error)
        setData([])
        setTotal(0)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void fetchData()

    return () => {
      active = false
    }
  }, [
    trimmedSearch,
    params.status,
    params.jenisJabatanId,
    params.unorId,
    params.page,
  ])

  return { data, total, limit, loading }
}