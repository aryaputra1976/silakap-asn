import { useState } from "react"
import { submitService } from "../../api/service.api"

export function useSubmitService(service: string) {

  const [loading, setLoading] = useState(false)

  async function submit(id: string) {

    try {

      setLoading(true)

      const res = await submitService(service, id)

      return res

    } catch (err) {

      console.error(err)
      throw err

    } finally {

      setLoading(false)

    }

  }

  return {
    submit,
    loading,
  }
}