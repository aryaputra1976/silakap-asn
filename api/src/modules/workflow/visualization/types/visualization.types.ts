export interface WorkflowNode {

  id: string
  label: string

}

export interface WorkflowEdge {

  from: string
  to: string

}

export interface WorkflowGraph {

  nodes: WorkflowNode[]
  edges: WorkflowEdge[]

}