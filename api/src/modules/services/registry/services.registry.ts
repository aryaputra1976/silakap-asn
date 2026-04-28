import { ServiceHandler } from "./services.registry.types"
import { BusinessError } from '@/core/errors/business.error'

import { PensiunApplicationService } from "../pensiun/application/pensiun.application.service"

/** Semua kode layanan yang dikenal sistem (aktif maupun belum). */
export type ServiceCode =
  | "PENSIUN"
  | "MUTASI"
  | "KGB"
  | "JABATAN"
  | "HUKDIS"
  | "TUGAS_BELAJAR"
  | "DATA_UPDATE"

export class ServicesRegistry {

  /**
   * Source of truth layanan aktif. Tambahkan entry di sini + import handler-nya
   * untuk mengaktifkan layanan baru. Frontend web/src/features/services/index.ts
   * harus sinkron dengan daftar ini.
   */
  private static factories: Record<string, () => ServiceHandler> = {

    PENSIUN: () => new PensiunApplicationService(),

  }

  static resolve(code: string): ServiceHandler {
    const normalized = code.toUpperCase()
    const factory = this.factories[normalized]

    if (!factory) {
      throw new BusinessError(
        'SERVICE_NOT_ACTIVATED',
        `Service ${code} belum diaktifkan`,
      )
    }

    return factory()
  }

  /** Seperti resolve() tapi return null jika tidak terdaftar, tidak throw. */
  static tryResolve(code: string): ServiceHandler | null {
    const normalized = code.toUpperCase()
    const factory = this.factories[normalized]
    return factory ? factory() : null
  }

}