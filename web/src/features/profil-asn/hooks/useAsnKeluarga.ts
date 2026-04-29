import { useEffect, useState } from "react"
import http from "@/core/http/httpClient"

export interface AsnPasangan {
  id: number
  nama: string
  tanggalLahir: string
  tanggalNikah: string
  urutanPernikahan: number
  statusPernikahan: "AKTIF" | "CERAI" | "MENINGGAL"
}

export interface AsnAnak {
  id: number
  nama: string
  tanggalLahir: string
  statusAnak: "KANDUNG" | "TIRI" | "ANGKAT"
  namaAyah?: string
  namaIbu?: string
}

export interface AsnKeluarga {
  pasangan: AsnPasangan[]
  anak: AsnAnak[]
}

export function useAsnKeluarga(asnId: string) {
  const [data, setData] = useState<AsnKeluarga>({ pasangan: [], anak: [] })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!asnId) return

    let isActive = true

    const fetchData = async () => {
      setLoading(true)

      try {
        const res = await http.get<AsnKeluarga>(`/asn/${asnId}/keluarga`)

        if (isActive) {
          setData(res.data)
        }
      } catch (err) {
        if (isActive) {
          console.error("KELUARGA ERROR", err)
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isActive = false
    }
  }, [asnId])

  return { data, loading }
}
