import { useState } from "react"
import { ServiceDocument } from "./schema.types"

interface Props {

  documents: ServiceDocument[]

  onChange?: (files: Record<string, File | null>) => void

}

export default function DocumentUploadSection({
  documents,
  onChange,
}: Props) {

  const [files, setFiles] = useState<Record<string, File | null>>({})

  function validateFile(file: File) {

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
    ]

    const maxSize = 5 * 1024 * 1024

    if (!allowedTypes.includes(file.type)) {
      alert("Format file harus PDF/JPG/PNG")
      return false
    }

    if (file.size > maxSize) {
      alert("Ukuran file maksimal 5MB")
      return false
    }

    return true

  }

  function updateFiles(newFiles: Record<string, File | null>) {

    setFiles(newFiles)

    onChange?.(newFiles)

  }

  function handleFileChange(
    code: string,
    file: File | null
  ) {

    if (!file) return

    if (!validateFile(file)) return

    updateFiles({
      ...files,
      [code]: file,
    })

  }

  function removeFile(code: string) {

    updateFiles({
      ...files,
      [code]: null,
    })

  }

  return (

    <div className="mt-4">

      <h5 className="mb-3">
        Dokumen Persyaratan
      </h5>

      <table className="table">

        <thead>
          <tr>
            <th>Dokumen</th>
            <th>File</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>

          {documents.map((doc) => {

            const file = files[doc.code]

            return (

              <tr key={doc.code}>

                <td>

                  {doc.label}

                  {doc.required && (
                    <span className="text-danger ms-1">*</span>
                  )}

                </td>

                <td>

                  {file ? (
                    <span>{file.name}</span>
                  ) : (
                    <span className="text-muted">
                      Belum upload
                    </span>
                  )}

                </td>

                <td>

                  {!file && (

                    <input
                      type="file"
                      onChange={(e) =>
                        handleFileChange(
                          doc.code,
                          e.target.files?.[0] || null
                        )
                      }
                    />

                  )}

                  {file && (

                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => removeFile(doc.code)}
                    >
                      Hapus
                    </button>

                  )}

                </td>

              </tr>

            )

          })}

        </tbody>

      </table>

    </div>

  )

}