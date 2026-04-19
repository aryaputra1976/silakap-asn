import { useEffect, useMemo, useState } from "react"
import http from "@/core/http/httpClient"

interface UnorNode {
  id: number
  nama: string
  parentId?: number | null
  hasChildren?: boolean
  count?: number
  children?: UnorNode[]
}

interface Props {
  selected?: number
  onSelect: (id: number, name?: string) => void
}

export function UnitTree({ selected, onSelect }: Props) {

  const [tree, setTree] = useState<UnorNode[]>([])
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [cache, setCache] = useState<Record<number, UnorNode[]>>({})

  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")

  /* ===============================
     SEARCH DEBOUNCE
  =============================== */

  useEffect(() => {

    const t = setTimeout(() => {
      setSearch(searchInput.trim().toLowerCase())
    }, 250)

    return () => clearTimeout(t)

  }, [searchInput])

  /* ===============================
     LOAD ROOT
  =============================== */

  useEffect(() => {
    loadRoot()
  }, [])

  const loadRoot = async () => {

    try {

      const res = await http.get<UnorNode[]>("/ref/unor/children")

      setTree(res.data ?? [])

    } catch (err) {

      console.error("TREE ROOT ERROR", err)

    }

  }

  /* ===============================
     LOAD CHILDREN
  =============================== */

  const loadChildren = async (node: UnorNode) => {

    if (!node.hasChildren) return

    if (cache[node.id]) {

      setTree(prev =>
        injectChildren(prev, node.id, cache[node.id])
      )

      return

    }

    try {

      const res = await http.get<UnorNode[]>(
        `/ref/unor/children?parent_id=${node.id}`
      )

      const children = res.data ?? []

      setCache(prev => ({
        ...prev,
        [node.id]: children
      }))

      setTree(prev =>
        injectChildren(prev, node.id, children)
      )

    } catch (err) {

      console.error("TREE CHILD ERROR", err)

    }

  }

  /* ===============================
     INJECT CHILDREN
  =============================== */

  const injectChildren = (
    nodes: UnorNode[],
    parentId: number,
    children: UnorNode[]
  ): UnorNode[] => {

    return nodes.map(node => {

      if (node.id === parentId) {

        return {
          ...node,
          children
        }

      }

      if (node.children) {

        return {
          ...node,
          children: injectChildren(node.children, parentId, children)
        }

      }

      return node

    })

  }

  /* ===============================
     TOGGLE NODE
  =============================== */

  const toggle = async (node: UnorNode) => {

    const isOpen = expanded[node.id]

    setExpanded(prev => ({
      ...prev,
      [node.id]: !isOpen
    }))

    if (!isOpen && !node.children) {

      await loadChildren(node)

    }

  }

  /* ===============================
     SEARCH MATCH
  =============================== */

  const match = (name: string) => {

    if (!search) return true

    return name.toLowerCase().includes(search)

  }

  const hasMatch = (node: UnorNode): boolean => {

    if (match(node.nama)) return true

    if (node.children) {

      return node.children.some(hasMatch)

    }

    return false

  }

  /* ===============================
     AUTO EXPAND SEARCH
  =============================== */

  useEffect(() => {

    if (!search) return

    const map: Record<number, boolean> = {}

    const walk = (nodes: UnorNode[]) => {

      nodes.forEach(n => {

        if (hasMatch(n)) {

          map[n.id] = true

        }

        if (n.children) {

          walk(n.children)

        }

      })

    }

    walk(tree)

    setExpanded(map)

  }, [search, tree])

  /* ===============================
     HIGHLIGHT SEARCH
  =============================== */

  const highlight = (text: string) => {

    if (!search) return text

    const index = text.toLowerCase().indexOf(search)

    if (index === -1) return text

    const before = text.substring(0, index)
    const matchText = text.substring(index, index + search.length)
    const after = text.substring(index + search.length)

    return (
      <>
        {before}
        <span className="tree-highlight">{matchText}</span>
        {after}
      </>
    )

  }

  /* ===============================
     SELECT NODE
  =============================== */

  const handleSelect = (node: UnorNode) => {

    onSelect(node.id, node.nama)

  }

  /* ===============================
     RENDER NODE
  =============================== */

const renderNode = (node: UnorNode) => {

  if (!hasMatch(node)) return null

  const isOpen = expanded[node.id]
  const active = selected === node.id

  return (

    <li key={node.id}>

      <div className={`tree-row ${active ? "tree-active" : ""}`}>

        {/* TOGGLE */}

        <span
          className="tree-toggle"
          onClick={() => node.hasChildren && toggle(node)}
        >
          {node.hasChildren && (
            <i className={`ki-outline ${isOpen ? "ki-down" : "ki-right"}`} />
          )}
        </span>

        {/* FOLDER */}

<span className="tree-folder">
  <span className={`ki-duotone ${isOpen ? "ki-folder-down" : "ki-folder-up"}`}>
    <span className="path1"></span>
    <span className="path2"></span>
  </span>
</span>

        {/* LABEL */}

        <span
          className="tree-label"
          onClick={() => handleSelect(node)}
          title={node.nama}
        >
          {highlight(node.nama)}

          {node.count !== undefined && (
            <span className="tree-count">
              ({node.count})
            </span>
          )}

        </span>

      </div>

      {isOpen && node.children && (

        <ul className="tree-children">

          {node.children.map(renderNode)}

        </ul>

      )}

    </li>

  )

}

  /* ===============================
     RENDER
  =============================== */

  return (

    <div className="unor-tree">

      <input
        className="form-control form-control-sm mb-3"
        placeholder="Cari unit..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />

      <ul className="tree-root">

        {tree.map(renderNode)}

      </ul>

    </div>

  )

}