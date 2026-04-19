import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { buildSearchIndex } from "@/app/navigation/menu.search"

const searchIndex = buildSearchIndex()

export default function NavigationSearch() {

  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const results = searchIndex.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {

    function handleKey(e: KeyboardEvent) {
console.log("KEY:", e.key)
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setOpen((v) => !v)
      }

    }

    window.addEventListener("keydown", handleKey)

    return () => window.removeEventListener("keydown", handleKey)

  }, [])

  if (!open) return null

  return (
    <div className="nav-search-overlay">

      <div className="nav-search-box">

        <input
          autoFocus
          placeholder="Search page..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <ul>

          {results.map((item) => (

            <li
              key={item.path}
              onClick={() => {
                navigate(item.path)
                setOpen(false)
              }}
            >
              {item.title}
            </li>

          ))}

        </ul>

      </div>

    </div>
  )
}