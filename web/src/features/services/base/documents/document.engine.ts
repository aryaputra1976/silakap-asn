import { getService } from "../registry"

export function getServiceDocuments(service: string) {

  const svc = getService(service)

  return svc?.documents || []

}