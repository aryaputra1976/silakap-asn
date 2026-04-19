import { ServiceConfig } from "./service.config"

const services = new Map<string, ServiceConfig>()

export function registerService(service: ServiceConfig): void {

  if (!service?.key) {
    throw new Error("Service must have a 'key'")
  }

  if (services.has(service.key)) {
    console.warn(`Service already registered: ${service.key}`)
    return
  }

  services.set(service.key, service)
}

export function getService(key: string): ServiceConfig | undefined {
  return services.get(key)
}

export function getServices(): ServiceConfig[] {
  return Array.from(services.values())
}

export function hasService(key: string): boolean {
  return services.has(key)
}

export function clearServices(): void {
  services.clear()
}