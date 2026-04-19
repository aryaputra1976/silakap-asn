import { useEffect, useState } from "react"

import { getDocuments } from "../api/document.api"

export function useServiceDocuments(
  service: string,
  id: string
) {

  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    async function load() {

      const data = await getDocuments(service, id)

      setDocuments(data)

      setLoading(false)

    }

    load()

  }, [service, id])

  return { documents, loading }

}