import { ModuleDefinition } from "./types"

const modules: ModuleDefinition[] = []

export function registerModule(module: ModuleDefinition) {

  const exists = modules.find((m) => m.name === module.name)

  if (exists) {
    console.warn(`Module ${module.name} already registered`)
    return
  }

  modules.push(module)

}

export function getModules(): ModuleDefinition[] {
  return modules
}

export function getRoutes() {

  return modules.flatMap((m) => m.routes ?? [])

}

export function getMenus() {

  return modules.flatMap((m) => m.menus ?? [])

}