import { ServiceHandler } from "./services.registry.types"
import { BusinessError } from '@/core/errors/business.error'

import { PensiunApplicationService } from "../pensiun/application/pensiun.application.service"

export type ServiceCode =
  | "PENSIUN"
  | "MUTASI"
  | "KGB"
  | "JABATAN"
  | "HUKDIS"
  | "TUGAS_BELAJAR"
  | "DATA_UPDATE"

export class ServicesRegistry {

  private static factories: Record<string, () => ServiceHandler> = {

    PENSIUN: () => new PensiunApplicationService()

  }

  static resolve(code: string): ServiceHandler {

    const normalized = code.toUpperCase()

    const factory = this.factories[normalized]

    if (!factory) {
      throw new Error(`Service ${code} belum diaktifkan`)
    }

    return factory()

  }

}