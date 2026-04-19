import { useUnorChildren } from "../hooks/useUnorChildren"
import UnorNode from "./UnorNode"

export default function UnorTree({ onSelect }: any) {

  const { data, loading } = useUnorChildren()

  if (loading) return <div>Loading...</div>

  return (

    <div>

      {data.map((node) => (

        <UnorNode
          key={node.id}
          node={node}
          onSelect={onSelect}
        />

      ))}

    </div>

  )

}