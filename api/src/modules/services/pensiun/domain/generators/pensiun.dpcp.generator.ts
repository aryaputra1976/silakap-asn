import { BusinessError } from "@/core/errors/business.error"

export class PensiunDPCPGenerator {

  generate(pensiun: any) {

    if (!pensiun) {
      throw new BusinessError(
        "PENSIUN_DATA_REQUIRED",
        "Data pensiun tidak tersedia"
      )
    }

    const perhitungan = pensiun.perhitungan

    if (!perhitungan) {
      throw new BusinessError(
        "PERHITUNGAN_REQUIRED",
        "Data perhitungan pensiun tidak tersedia"
      )
    }

    return {

      pegawai: {

        nama: pensiun.namaSnapshot ?? null,
        nip: pensiun.nipSnapshot ?? null,

        tempatLahir: pensiun.tempatLahirSnapshot ?? null,
        tanggalLahir: pensiun.tanggalLahirSnapshot ?? null,

        jabatan: pensiun.jabatanSnapshot ?? null,
        unitKerja: pensiun.unitKerjaSnapshot ?? null

      },

      pensiun: {

        tmtPensiun: pensiun.tmtPensiun ?? null,
        dasarHukum: pensiun.dasarHukum ?? null,
        keterangan: pensiun.keterangan ?? null

      },

      perhitungan: {

        masaKerja: {

          tahun: perhitungan.masaKerjaTahun ?? 0,
          bulan: perhitungan.masaKerjaBulan ?? 0

        },

        gajiPokok: perhitungan.gajiPokok ?? 0,

        estimasiPensiun: perhitungan.estimasiPensiun ?? 0

      }

    }

  }

}