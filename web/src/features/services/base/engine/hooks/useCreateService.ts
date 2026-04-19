import { useState } from "react"
import { createService } from "../../api/service.api"

export function useCreateService(service: string) {

  const [loading, setLoading] = useState(false)

  async function create(payload: any) {

    try {

      setLoading(true)

      const res = await createService(service, payload)

      return res

    } catch (err) {

      console.error(err)
      throw err

    } finally {

      setLoading(false)

    }

  }

  return {
    create,
    loading,
  }
}