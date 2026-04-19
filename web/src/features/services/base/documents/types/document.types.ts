export interface ServiceDocumentConfig {

  key: string

  label: string

  required?: boolean

}

export interface ServiceDocument {

  id: string

  key: string

  url: string

  status: "uploaded" | "verified" | "rejected"

}