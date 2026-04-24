import ServiceSchemaForm from "../../../base/schema/ServiceSchemaForm"
import { kgbSchema } from "../schema"

interface Props {
  onSubmit: (data: any) => Promise<void> | void
}

export default function KgbForm({ onSubmit }: Props) {
  return (
    <ServiceSchemaForm
      schema={kgbSchema}
      onSubmit={onSubmit}
    />
  )
}
