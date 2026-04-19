import type { ComponentType } from "react"
import type { ServiceDocumentConfig } from "../documents/types/document.types"

export interface ServiceDashboardConfig {
  override?: ComponentType
}

export interface ServiceConfig {

  key: string
  name: string

  description?: string
  icon?: string

  /* form create */
  form?: ComponentType<any>

  /* dashboard override */
  dashboard?: ServiceDashboardConfig

  /* document engine */
  documents?: ServiceDocumentConfig[]

}