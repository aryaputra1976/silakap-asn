import ServiceSchemaForm from "../../../base/schema/ServiceSchemaForm"
import { pensiunSchema } from "../schema"

interface Props {
  onSubmit: (data: any) => Promise<void> | void
}

export default function PensiunForm({ onSubmit }: Props) {
  return (
    <ServiceSchemaForm
      schema={pensiunSchema}
      onSubmit={onSubmit}
    />
  )
}