import {
  useMemo,
  useState,
  useEffect,
  useCallback
} from "react"

import type { WorkforceOpd } from "../types"
import WorkforceUnitDrawer from "./WorkforceUnitDrawer"
import { aggregateTree } from "../utils/aggregateWorkforceTree"

interface Props {
  data?: WorkforceOpd[]
}

interface Node extends WorkforceOpd {
  children: Node[]
}

/* =====================================================
   BUILD TREE
===================================================== */

function buildTree(data: WorkforceOpd[]): Node[] {

  const map = new Map<number, Node>()
  const roots: Node[] = []

  data.forEach(n => {

    const id = Number(n.unorId)

    const parentId =
      n.parentId !== null && n.parentId !== undefined
        ? Number(n.parentId)
        : null

    map.set(id, {
      ...n,
      unorId: id,
      parentId,
      children: []
    })

  })

  map.forEach(node => {

    if (!node.parentId) {

      roots.push(node)
      return

    }

    const parent =
      map.get(node.parentId)

    if (parent)
      parent.children.push(node)
    else
      roots.push(node)

  })

  return roots

}

/* =====================================================
   FUZZY SEARCH
===================================================== */

function fuzzyMatch(text: string, keyword: string) {

  const t = text.toLowerCase()
  const k = keyword.toLowerCase()

  let i = 0

  for (const char of t) {

    if (char === k[i])
      i++

    if (i === k.length)
      return true

  }

  return false

}

/* =====================================================
   FILTER TREE
===================================================== */

function filterTree(nodes: Node[], keyword: string): Node[] {

  if (!keyword) return nodes

  function walk(list: Node[]): Node[] {

    const result: Node[] = []

    list.forEach(node => {

      const match =
        fuzzyMatch(node.namaUnor, keyword)

      const children =
        walk(node.children)

      if (match || children.length) {

        result.push({
          ...node,
          children
        })

      }

    })

    return result

  }

  return walk(nodes)

}

/* =====================================================
   BADGE GAP
===================================================== */

function gapBadge(gap: number) {

  if (gap > 10)
    return <span className="badge badge-light-danger">Kritis</span>

  if (gap > 0)
    return <span className="badge badge-light-warning">Kurang</span>

  return <span className="badge badge-light-success">Ideal</span>

}

/* =====================================================
   HIGHLIGHT SEARCH
===================================================== */

function highlight(text: string, keyword: string) {

  if (!keyword) return text

  const parts =
    text.split(new RegExp(`(${keyword})`, "gi"))

  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLowerCase()
      ? <mark key={i}>{part}</mark>
      : part
  )

}

/* =====================================================
   COMPONENT
===================================================== */

export default function WorkforceTreeTable({ data = [] }: Props) {

  const [expanded, setExpanded] =
    useState<Record<number, boolean>>({})

  const [selectedUnit, setSelectedUnit] =
    useState<WorkforceOpd | null>(null)

  const [search, setSearch] =
    useState("")

  const [sortGap, setSortGap] =
    useState(false)

  /* deduplicate */

  const uniqueData = useMemo(() => {

    return Array.from(
      new Map(
        data.map(d => [Number(d.unorId), d])
      ).values()
    )

  }, [data])

  /* build tree */

  const tree = useMemo(() => {

    const built = buildTree(uniqueData)

    return aggregateTree(built)

  }, [uniqueData])

  /* filter tree */

  const filteredTree = useMemo(
    () => filterTree(tree, search),
    [tree, search]
  )

  /* sort gap */

  const sortedTree = useMemo(() => {

    if (!sortGap)
      return filteredTree

    function walk(nodes: Node[]): Node[] {

      return [...nodes]
        .sort((a, b) => b.gapAsn - a.gapAsn)
        .map(n => ({
          ...n,
          children: walk(n.children)
        }))

    }

    return walk(filteredTree)

  }, [filteredTree, sortGap])

  /* auto expand root */

  useEffect(() => {

    const open: Record<number, boolean> = {}

    function walk(nodes: Node[]) {

      nodes.forEach(node => {

        open[node.unorId] = true

        if (node.children.length)
          walk(node.children)

      })

    }

    walk(tree)

    setExpanded(open)

  }, [tree])

  /* toggle */

  const toggle = useCallback((id: number) => {

    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }))

  }, [])

  function expandAll(nodes: Node[]) {

    const map: Record<number, boolean> = {}

    function walk(n: Node[]) {

      n.forEach(node => {

        map[node.unorId] = true

        if (node.children.length)
          walk(node.children)

      })

    }

    walk(nodes)

    setExpanded(map)

  }

  function collapseAll() {
    setExpanded({})
  }

  /* export CSV */

  function exportCSV() {

    const rows = data.map(r => [

      r.namaUnor,
      r.asnEksisting,
      r.kebutuhanAsn,
      r.gapAsn,
      r.pensiun5Tahun,
      r.rekomendasiFormasi

    ])

    const csv =
      "Unit,ASN,Kebutuhan,Gap,Pensiun,Rekomendasi\n" +
      rows.map(r => r.join(",")).join("\n")

    const blob =
      new Blob([csv], { type: "text/csv" })

    const url =
      URL.createObjectURL(blob)

    const a =
      document.createElement("a")

    a.href = url
    a.download = "workforce-opd.csv"
    a.click()

  }

  /* render rows */

  function renderRows(nodes: Node[], level = 0): JSX.Element[] {

    const rows: JSX.Element[] = []

    nodes.forEach(node => {

      const hasChildren =
        node.children.length > 0

      const isOpen =
        expanded[node.unorId]

      rows.push(

        <tr key={node.unorId}>

          <td>

            <div
              className="d-flex align-items-center"
              style={{ paddingLeft: level * 24 }}
            >

              {hasChildren ? (

                <button
                  className="btn btn-sm btn-icon btn-light me-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggle(node.unorId)
                  }}
                >
                  {isOpen ? "▾" : "▸"}
                </button>

              ) : (

                <span className="text-gray-400 me-3">•</span>

              )}

              <span className="fw-semibold">
                {highlight(node.namaUnor, search)}
              </span>

            </div>

          </td>

          <td className="text-end">
            {node.asnEksisting.toLocaleString()}
          </td>

          <td className="text-end">
            {node.kebutuhanAsn.toLocaleString()}
          </td>

          <td className="text-end">
            {gapBadge(node.gapAsn)}
          </td>

          <td className="text-end">
            {node.pensiun5Tahun.toLocaleString()}
          </td>

          <td className="text-end fw-bold text-primary">
            {node.rekomendasiFormasi.toLocaleString()}
          </td>

        </tr>

      )

      if (hasChildren && isOpen)
        rows.push(...renderRows(node.children, level + 1))

    })

    return rows

  }

  /* UI */

  return (

    <div className="card">

      <div className="card-header border-0 pt-6">

        <div className="card-title">
          <h3 className="fw-bold">
            Analisis Gap ASN per Unit
          </h3>
        </div>

        <div className="card-toolbar d-flex gap-3">

          <input
            type="text"
            placeholder="Cari Unit..."
            className="form-control form-control-sm w-250px"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            className="btn btn-light-primary btn-sm"
            onClick={() => setSortGap(v => !v)}
          >
            Sort Gap
          </button>

          <button
            className="btn btn-light-primary btn-sm"
            onClick={() => expandAll(sortedTree)}
          >
            Expand
          </button>

          <button
            className="btn btn-light btn-sm"
            onClick={collapseAll}
          >
            Collapse
          </button>

          <button
            className="btn btn-light-success btn-sm"
            onClick={exportCSV}
          >
            Export CSV
          </button>

        </div>

      </div>

      <div className="card-body py-4">

        <div className="table-responsive">

          <table className="table table-row-bordered table-row-dashed align-middle">

            <thead className="fs-7 text-gray-500 text-uppercase">

              <tr>
                <th>Unit Organisasi</th>
                <th className="text-end">ASN</th>
                <th className="text-end">Kebutuhan</th>
                <th className="text-end">Gap</th>
                <th className="text-end">Pensiun</th>
                <th className="text-end">Rekomendasi</th>
              </tr>

            </thead>

            <tbody>

              {renderRows(sortedTree)}

            </tbody>

          </table>

        </div>

      </div>

      <WorkforceUnitDrawer
        unit={selectedUnit}
        onClose={() => setSelectedUnit(null)}
      />

    </div>

  )

}