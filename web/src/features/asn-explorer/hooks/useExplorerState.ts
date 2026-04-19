import { useState } from "react"

export const useExplorerState = () => {

  const [unitId, setUnitId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  return {
    unitId,
    setUnitId,
    search,
    setSearch,
    page,
    setPage
  }

}