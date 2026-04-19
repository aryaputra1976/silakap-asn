import { useState } from "react"
import { useUnorChildren } from "../hooks/useUnorChildren"

export default function UnorNode({ node, onSelect }: any) {

  const [open, setOpen] = useState(false)

  const { data } = useUnorChildren(open ? node.id : undefined)

  return (
    <div>

      <div
        className="d-flex align-items-center cursor-pointer"
        onClick={() => {
          setOpen(!open)
          onSelect(node)
        }}
      >
        {node.hasChildren && (
          <span className="me-1">
            {open ? "📂" : "📁"}
          </span>
        )}

        <span>{node.nama}</span>
      </div>

      {open && (

        <div className="ms-4">

          {data.map((c) => (
            <UnorNode
              key={c.id}
              node={c}
              onSelect={onSelect}
            />
          ))}

        </div>

      )}

    </div>
  )

}