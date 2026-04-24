import { useEffect, useState } from "react"

import { getDocuments } from "../api/document.api"

export function useServiceDocuments(
  service: string,
  id: string
) {

  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {

    try {
      setLoading(true)

      const data = await getDocuments(service, id)

      setDocuments(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [service, id])

  return { documents, loading, reload: load }

}
