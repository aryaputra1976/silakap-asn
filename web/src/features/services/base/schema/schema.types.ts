export type FieldType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "textarea"

export interface ServiceField {

  name: string

  label: string

  type: FieldType

  required?: boolean

  options?: { label: string; value: string }[]

}

export interface ServiceDocument {

  code: string

  label: string

  required?: boolean

}

export interface ServiceSchema {

  fields: ServiceField[]

  documents?: ServiceDocument[]

}