// web/src/features/profil-asn/components/UnitTree.tsx
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
  keyword?: string
  onSelect: (id: number, name?: string) => void
}

function normalizeKeyword(value: string) {
  return value.trim().toLowerCase()
}

function filterTree(nodes: UnorNode[], keyword: string): UnorNode[] {
  const normalized = normalizeKeyword(keyword)

  if (!normalized) {
    return nodes
  }

  const result: UnorNode[] = []

  for (const node of nodes) {
    const filteredChildren = filterTree(node.children ?? [], keyword)
    const selfMatch = normalizeKeyword(node.nama).includes(normalized)

    if (selfMatch || filteredChildren.length > 0) {
      result.push({
        ...node,
        children: filteredChildren,
      })
    }
  }

  return result
}

function collectExpandedIds(nodes: UnorNode[], target = new Set<number>()) {
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      target.add(node.id)
      collectExpandedIds(node.children, target)
    }
  }

  return target
}

export function UnitTree({
  selected,
  keyword = "",
  onSelect,
}: Props) {
  const [tree, setTree] = useState<UnorNode[]>([])
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [cache, setCache] = useState<Record<number, UnorNode[]>>({})
  const [loadingRoot, setLoadingRoot] = useState(false)
  const [loadingSearchTree, setLoadingSearchTree] = useState(false)
  const [fullTreeLoaded, setFullTreeLoaded] = useState(false)

  const normalizedKeyword = useMemo(() => normalizeKeyword(keyword), [keyword])

  useEffect(() => {
    void loadRoot()
  }, [])

  useEffect(() => {
    if (!normalizedKeyword) {
      return
    }

    if (fullTreeLoaded || loadingSearchTree || tree.length === 0) {
      return
    }

    void ensureFullTreeLoaded()
  }, [normalizedKeyword, fullTreeLoaded, loadingSearchTree, tree])

  const fetchChildren = async (parentId?: number) => {
    const query = parentId !== undefined ? `?parent_id=${parentId}` : ""
    const res = await http.get<UnorNode[]>(`/ref/unor/children${query}`)
    return res.data ?? []
  }

  const loadRoot = async () => {
    try {
      setLoadingRoot(true)
      const rootNodes = await fetchChildren()
      setTree(rootNodes)
    } catch (error) {
      console.error("TREE ROOT ERROR", error)
    } finally {
      setLoadingRoot(false)
    }
  }

  const injectChildren = (
    nodes: UnorNode[],
    parentId: number,
    children: UnorNode[]
  ): UnorNode[] => {
    return nodes.map((node) => {
      if (node.id === parentId) {
        return {
          ...node,
          children,
        }
      }

      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: injectChildren(node.children, parentId, children),
        }
      }

      return node
    })
  }

  const hydrateNode = async (node: UnorNode): Promise<UnorNode> => {
    if (!node.hasChildren) {
      return {
        ...node,
        children: node.children ?? [],
      }
    }

    const cachedChildren = cache[node.id]
    const children =
      cachedChildren !== undefined ? cachedChildren : await fetchChildren(node.id)

    const hydratedChildren = await Promise.all(
      children.map(async (child) => hydrateNode(child))
    )

    return {
      ...node,
      children: hydratedChildren,
    }
  }

  const ensureFullTreeLoaded = async () => {
    try {
      setLoadingSearchTree(true)

      const hydratedTree = await Promise.all(
        tree.map(async (node) => hydrateNode(node))
      )

      const nextCache: Record<number, UnorNode[]> = {}

      const collectCache = (nodes: UnorNode[]) => {
        for (const node of nodes) {
          if (node.children) {
            nextCache[node.id] = node.children
            collectCache(node.children)
          }
        }
      }

      collectCache(hydratedTree)

      setCache((prev) => ({
        ...prev,
        ...nextCache,
      }))
      setTree(hydratedTree)
      setFullTreeLoaded(true)
    } catch (error) {
      console.error("TREE FULL LOAD ERROR", error)
    } finally {
      setLoadingSearchTree(false)
    }
  }

  const loadChildren = async (node: UnorNode) => {
    if (!node.hasChildren) {
      return
    }

    if (cache[node.id]) {
      setTree((prev) => injectChildren(prev, node.id, cache[node.id]))
      return
    }

    try {
      const children = await fetchChildren(node.id)

      setCache((prev) => ({
        ...prev,
        [node.id]: children,
      }))

      setTree((prev) => injectChildren(prev, node.id, children))
    } catch (error) {
      console.error("TREE CHILD ERROR", error)
    }
  }

  const toggle = async (node: UnorNode) => {
    const isOpen = Boolean(expanded[node.id])

    setExpanded((prev) => ({
      ...prev,
      [node.id]: !isOpen,
    }))

    if (!isOpen && !node.children && node.hasChildren) {
      await loadChildren(node)
    }
  }

  const filteredTree = useMemo(() => filterTree(tree, keyword), [tree, keyword])

  const autoExpandedIds = useMemo(() => {
    if (!normalizedKeyword) {
      return new Set<number>()
    }

    return collectExpandedIds(filteredTree)
  }, [filteredTree, normalizedKeyword])

  const highlight = (text: string) => {
    if (!normalizedKeyword) {
      return text
    }

    const normalizedText = text.toLowerCase()
    const index = normalizedText.indexOf(normalizedKeyword)

    if (index === -1) {
      return text
    }

    const before = text.slice(0, index)
    const matchText = text.slice(index, index + normalizedKeyword.length)
    const after = text.slice(index + normalizedKeyword.length)

    return (
      <>
        {before}
        <mark
          style={{
            backgroundColor: "rgba(54, 153, 255, 0.12)",
            color: "#1b84ff",
            padding: "0 2px",
            borderRadius: 4,
          }}
        >
          {matchText}
        </mark>
        {after}
      </>
    )
  }

  const renderNode = (node: UnorNode) => {
    const isOpen = normalizedKeyword
      ? autoExpandedIds.has(node.id) || Boolean(expanded[node.id])
      : Boolean(expanded[node.id])

    const active = selected === node.id

    return (
      <li key={node.id}>
        <div className={`tree-row ${active ? "tree-active" : ""}`}>
          <span
            className="tree-toggle"
            onClick={() => node.hasChildren && void toggle(node)}
          >
            {node.hasChildren ? (
              <i className={`ki-outline ${isOpen ? "ki-down" : "ki-right"}`} />
            ) : null}
          </span>

          <span className="tree-folder">
            <span
              className={`ki-duotone ${
                isOpen ? "ki-folder-down" : "ki-folder-up"
              }`}
            >
              <span className="path1" />
              <span className="path2" />
            </span>
          </span>

          <span
            className="tree-label"
            onClick={() => onSelect(node.id, node.nama)}
            title={node.nama}
          >
            {highlight(node.nama)}
            {node.count !== undefined ? (
              <span className="tree-count">({node.count})</span>
            ) : null}
          </span>
        </div>

        {isOpen && node.children && node.children.length > 0 ? (
          <ul className="tree-children">{node.children.map(renderNode)}</ul>
        ) : null}
      </li>
    )
  }

  if (loadingRoot) {
    return (
      <div className="d-flex align-items-center justify-content-center py-10 text-muted fs-7">
        Memuat tree unit organisasi...
      </div>
    )
  }

  if (loadingSearchTree) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-10">
        <div className="spinner-border text-primary mb-3" role="status" />
        <div className="fw-semibold text-gray-800 mb-1">
          Menelusuri seluruh tree unit...
        </div>
        <div className="text-muted fs-7 text-center">
          Cabang unit sedang dimuat sampai level terdalam.
        </div>
      </div>
    )
  }

  if (filteredTree.length === 0) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-10">
        <div className="fw-bolder text-gray-800 mb-1">
          Unit tidak ditemukan
        </div>
        <div className="text-muted fs-7 text-center">
          Coba kata kunci lain atau kosongkan pencarian.
        </div>
      </div>
    )
  }

  return (
    <div className="unor-tree">
      <ul className="tree-root">{filteredTree.map(renderNode)}</ul>
    </div>
  )
}