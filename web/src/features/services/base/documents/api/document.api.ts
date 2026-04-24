import http from "@/core/http/httpClient"
import { env } from "@/core/utils/env"

export async function getDocuments(
  service: string,
  id: string
) {

  const res = await http.get(
    `/services/${service}/${id}/documents`
  )

  return res.data

}

export async function uploadDocument(
  service: string,
  id: string,
  key: string,
  file: File
) {

  const form = new FormData()

  form.append("file", file)
  form.append("key", key)

  const res = await http.post(
    `/services/${service}/${id}/documents`,
    form
  )

  return res.data

}

export function resolveDocumentUrl(url?: string | null) {
  if (!url) {
    return ""
  }

  if (/^https?:\/\//i.test(url)) {
    return url
  }

  return new URL(url, env.apiUrl).toString()
}
