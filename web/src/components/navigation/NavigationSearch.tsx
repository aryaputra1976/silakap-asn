import { CSSProperties, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { buildSearchIndex } from "@/app/navigation/menu.search"

const searchIndex = buildSearchIndex()

export const NAV_SEARCH_OPEN_EVENT = "silakap:navigation-search-open"
export const NAV_SEARCH_CLOSE_EVENT = "silakap:navigation-search-close"

export default function NavigationSearch() {
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const normalizedQuery = query.trim().toLowerCase()

  const navigationResults = useMemo(() => {
    if (!normalizedQuery) {
      return searchIndex.slice(0, 8)
    }

    return searchIndex
      .filter((item) =>
        item.keywords.some((keyword) =>
          keyword.includes(normalizedQuery)
        )
      )
      .slice(0, 8)
  }, [normalizedQuery])

  const quickAsnResult = normalizedQuery
    ? {
        id: `asn-${normalizedQuery}`,
        title: `Cari ASN: ${query.trim()}`,
        description: "Buka daftar ASN dengan filter NIP atau nama",
        path: `/asn/profil?search=${encodeURIComponent(query.trim())}`,
      }
    : null

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault()
        setOpen((value) => !value)
      }

      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    function handleOpen() {
      setOpen(true)
    }

    function handleClose() {
      setOpen(false)
    }

    window.addEventListener("keydown", handleKey)
    window.addEventListener(NAV_SEARCH_OPEN_EVENT, handleOpen)
    window.addEventListener(NAV_SEARCH_CLOSE_EVENT, handleClose)

    return () => {
      window.removeEventListener("keydown", handleKey)
      window.removeEventListener(NAV_SEARCH_OPEN_EVENT, handleOpen)
      window.removeEventListener(NAV_SEARCH_CLOSE_EVENT, handleClose)
    }
  }, [])

  useEffect(() => {
    if (!open) {
      setQuery("")
    }
  }, [open])

  if (!open) {
    return null
  }

  return (
    <div
      className="nav-search-overlay"
      onClick={() => setOpen(false)}
      style={overlayStyle}
    >
      <div
        className="nav-search-box"
        onClick={(event) => event.stopPropagation()}
        style={boxStyle}
      >
        <input
          autoFocus
          placeholder="Cari menu, modul, atau ketik NIP/nama ASN..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          style={inputStyle}
        />

        <div style={resultsContainerStyle}>
          {quickAsnResult ? (
            <button
              type="button"
              onClick={() => {
                navigate(quickAsnResult.path)
                setOpen(false)
              }}
              style={resultButtonStyle}
            >
              <div className="fw-bold text-start">
                {quickAsnResult.title}
              </div>
              <div className="text-muted small text-start">
                {quickAsnResult.description}
              </div>
            </button>
          ) : null}

          {navigationResults.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                navigate(item.path)
                setOpen(false)
              }}
              style={resultButtonStyle}
            >
              <div className="fw-semibold text-start">
                {item.title}
              </div>
              <div className="text-muted small text-start">
                {item.section ?? "Navigasi"} · {item.path}
              </div>
            </button>
          ))}

          {quickAsnResult === null && navigationResults.length === 0 ? (
            <div className="text-muted small px-3 py-4">
              Tidak ada hasil pencarian.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(6, 10, 20, 0.58)",
  backdropFilter: "blur(10px)",
  zIndex: 2000,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: "10vh 1rem 1rem",
}

const boxStyle: CSSProperties = {
  width: "min(720px, 100%)",
  borderRadius: "1.25rem",
  background: "#ffffff",
  boxShadow: "0 30px 80px rgba(15, 23, 42, 0.32)",
  overflow: "hidden",
}

const inputStyle: CSSProperties = {
  width: "100%",
  border: 0,
  outline: 0,
  padding: "1.1rem 1.25rem",
  fontSize: "1rem",
  borderBottom: "1px solid #eef1f6",
}

const resultsContainerStyle: CSSProperties = {
  maxHeight: "26rem",
  overflowY: "auto",
  padding: "0.5rem",
}

const resultButtonStyle: CSSProperties = {
  width: "100%",
  border: 0,
  background: "transparent",
  borderRadius: "0.9rem",
  padding: "0.85rem 0.95rem",
  display: "block",
}
