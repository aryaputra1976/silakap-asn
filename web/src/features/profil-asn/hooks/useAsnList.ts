import { useEffect, useState } from "react"
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

export function useAsnList(params: UseAsnListParams) {

  const [data, setData] = useState<AsnItem[]>([])
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(20)
  const [loading, setLoading] = useState(false)

  const [debouncedSearch, setDebouncedSearch] = useState("")

  /* ===============================
     DEBOUNCE SEARCH
  =============================== */

  useEffect(() => {

    const t = setTimeout(() => {
      setDebouncedSearch(params.search ?? "")
    }, 400)

    return () => clearTimeout(t)

  }, [params.search])

  /* ===============================
     FETCH ASN
  =============================== */

  useEffect(() => {

    let active = true

    const fetchData = async () => {

      const query: any = {}

      if (debouncedSearch.trim() !== "") {
        query.search = debouncedSearch.trim()
      }

      if (params.status) query.status = params.status
      if (params.jenisJabatanId) query.jenisJabatanId = params.jenisJabatanId
      if (params.unorId) query.unorId = params.unorId
      if (params.page) query.page = params.page

      setLoading(true)

      try {

        const res = await http.get("/asn", { params: query })

        if (!active) return

        setData(res.data.data ?? [])
        setTotal(res.data.meta?.total ?? 0)
        setLimit(res.data.meta?.limit ?? 20)

      } catch (err) {

        console.error("ASN LOAD ERROR", err)

      } finally {

        if (active) setLoading(false)

      }

    }

    fetchData()

    return () => {
      active = false
    }

  }, [
    debouncedSearch,
    params.status,
    params.jenisJabatanId,
    params.unorId,
    params.page
  ])

  return { data, total, limit, loading }

}