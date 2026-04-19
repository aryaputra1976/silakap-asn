import { useEffect, useState } from "react"
import http from "@/core/http/httpClient"

export interface AsnDetail {
  id: number
  nip: string
  nama: string
  statusAsn: string
  jabatan?: string | null
  golongan?: string | null
  unitKerja?: string | null
  tempatLahir?: string | null
  tanggalLahir?: string | null

  jenisKelamin?: {
    nama: string
  }

  fotoUrl?: string | null
}

export function useAsnDetail(id?: string) {
  const [data, setData] = useState<AsnDetail | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      setLoading(true)

      try {
        const res = await http.get<AsnDetail>(`/asn/${id}`)
        setData(res.data)
      } catch (err) {
        console.error("ASN DETAIL ERROR:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  return { data, loading }
}