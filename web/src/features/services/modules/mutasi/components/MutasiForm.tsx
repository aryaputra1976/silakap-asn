import ServiceSchemaForm from "../../../base/schema/ServiceSchemaForm"
import { mutasiSchema } from "../schema"

interface Props {
  onSubmit: (data: any) => Promise<void> | void
}

export default function MutasiForm({ onSubmit }: Props) {
  return (
    <ServiceSchemaForm
      schema={mutasiSchema}
      onSubmit={onSubmit}
    />
  )
}
