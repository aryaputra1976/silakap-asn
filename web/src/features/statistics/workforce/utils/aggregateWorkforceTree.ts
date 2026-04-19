import type { WorkforceOpd } from "../types"

export interface WorkforceNode extends WorkforceOpd {
  children: WorkforceNode[]
}

/* =====================================================
   AGGREGATE CHILDREN → PARENT
===================================================== */

export function aggregateTree(nodes: WorkforceNode[]): WorkforceNode[] {

  function walk(node: WorkforceNode): WorkforceNode {

    if (!node.children.length)
      return node

    node.children.forEach(child => {

      const c = walk(child)

      node.asnEksisting += c.asnEksisting
      node.kebutuhanAsn += c.kebutuhanAsn
      node.pensiun5Tahun += c.pensiun5Tahun

    })

    node.gapAsn =
      Math.max(
        node.kebutuhanAsn - node.asnEksisting,
        0
      )

    node.rekomendasiFormasi =
      node.gapAsn + node.pensiun5Tahun

    return node

  }

  return nodes.map(walk)

}