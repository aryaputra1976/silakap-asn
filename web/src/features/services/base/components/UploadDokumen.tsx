import React, { useState } from "react"
import http from "@/core/http/httpClient"
import { ServiceDokumen } from "../types/service.types"

interface Props {

  serviceId: string

  dokumen: ServiceDokumen[]

  onUploaded?: () => void

}

export default function UploadDokumen({

  serviceId,

  dokumen = [],

  onUploaded,

}: Props) {

  const [loading, setLoading] = useState(false)

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {

    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]

    const formData = new FormData()

    formData.append("file", file)
    formData.append("serviceId", serviceId)

    try {

      setLoading(true)

      await http.post(
        `/documents/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      e.target.value = ""

      onUploaded?.()

    } catch (err) {

      console.error(err)

    } finally {

      setLoading(false)

    }

  }

  return (

    <div>

      <input
        type="file"
        className="form-control"
        onChange={handleUpload}
        disabled={loading}
      />

      <table className="table mt-3">

        <thead>

          <tr>
            <th>Nama Dokumen</th>
            <th style={{ width: 120 }}>Aksi</th>
          </tr>

        </thead>

        <tbody>

          {dokumen.length === 0 && (
            <tr>
              <td colSpan={2} className="text-muted text-center">
                Belum ada dokumen
              </td>
            </tr>
          )}

          {dokumen.map((doc) => (

            <tr key={doc.id}>

              <td>
                {doc.nama}
              </td>

              <td>

                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-light"
                >
                  Download
                </a>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )

}