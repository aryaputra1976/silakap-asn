import { ReactNode } from "react"

export interface ModuleRoute {

  path: string

  element: ReactNode

}

export interface ModuleMenu {

  label: string

  path: string

  icon?: string

  permission?: string

}

export interface ModuleDefinition {

  name: string

  routes?: ModuleRoute[]

  menus?: ModuleMenu[]

}