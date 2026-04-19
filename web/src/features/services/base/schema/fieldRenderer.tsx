import { ServiceField } from "./schema.types"

export function renderField(
  field: ServiceField,
  value: any,
  onChange: (name: string, value: any) => void
) {

  const commonProps = {
    className: "form-control",
    value: value ?? "",
    onChange: (e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >) => onChange(field.name, e.target.value),
  }

  switch (field.type) {

    case "text":
      return <input type="text" {...commonProps} />

    case "number":
      return <input type="number" {...commonProps} />

    case "date":
      return <input type="date" {...commonProps} />

    case "textarea":
      return <textarea {...commonProps} />

    case "select":
      return (
        <select {...commonProps}>
          <option value="">Pilih</option>

          {field.options?.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
            >
              {opt.label}
            </option>
          ))}

        </select>
      )

    default:
      return null

  }

}