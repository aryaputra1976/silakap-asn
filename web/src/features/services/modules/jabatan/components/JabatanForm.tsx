import ServiceSchemaForm from "../../../base/schema/ServiceSchemaForm"
import { jabatanSchema } from "../schema"

interface Props {
  onSubmit: (data: any) => Promise<void> | void
}

export default function JabatanForm({ onSubmit }: Props) {
  return (
    <ServiceSchemaForm
      schema={jabatanSchema}
      onSubmit={onSubmit}
    />
  )
}
