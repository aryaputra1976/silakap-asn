import { useState } from "react"
import { ServiceSchema } from "./schema.types"
import { renderField } from "./fieldRenderer"
import DocumentUploadSection from "./DocumentUploadSection"

interface Props {

  schema: ServiceSchema

  onSubmit: (data: any) => void

}

export default function ServiceSchemaForm({
  schema,
  onSubmit,
}: Props) {

  const [form, setForm] = useState<Record<string, any>>({})
  const [files, setFiles] = useState<Record<string, File | null>>({})

  function handleChange(name: string, value: any) {

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))

  }

  function handleFilesChange(
    uploaded: Record<string, File | null>
  ) {

    setFiles(uploaded)

  }

  function validate() {

    for (const field of schema.fields) {

      if (field.required && !form[field.name]) {

        alert(`${field.label} wajib diisi`)

        return false

      }

    }

    if (schema.documents) {

      for (const doc of schema.documents) {

        if (doc.required && !files[doc.code]) {

          alert(`${doc.label} wajib diupload`)

          return false

        }

      }

    }

    return true

  }

  function submit(e: React.FormEvent) {

    e.preventDefault()

    if (!validate()) return

    onSubmit({
      ...form,
      documents: files,
    })

  }

  return (

    <form onSubmit={submit}>

      {schema.fields.map((field) => (

        <div key={field.name} className="mb-3">

          <label className="form-label">

            {field.label}

            {field.required && (
              <span className="text-danger ms-1">*</span>
            )}

          </label>

          {renderField(
            field,
            form[field.name],
            handleChange
          )}

        </div>

      ))}

      {schema.documents && schema.documents.length > 0 && (

        <DocumentUploadSection
          documents={schema.documents}
          onChange={handleFilesChange}
        />

      )}

      <div className="mt-4">

        <button
          type="submit"
          className="btn btn-primary"
        >
          Simpan
        </button>

      </div>

    </form>

  )
}