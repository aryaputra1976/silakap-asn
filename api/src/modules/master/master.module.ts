import { Module } from '@nestjs/common'

import { AgamaModule } from './agama/agama.module'
import { AlasanPensiunModule } from './alasan-pensiun/alasan-pensiun.module'
import { GolonganModule } from './golongan/golongan.module'
import { JabatanModule } from './jabatan/jabatan.module'
import { JenisJabatanModule } from './jenis-jabatan/jenis-jabatan.module'
import { JenisKelaminModule } from './jenis-kelamin/jenis-kelamin.module'
import { JenisLayananModule } from './jenis-layanan/jenis-layanan.module'
import { JenisPegawaiModule } from './jenis-pegawai/jenis-pegawai.module'
import { JenisPensiunModule } from './jenis-pensiun/jenis-pensiun.module'
import { InstansiModule } from './instansi/instansi.module'
import { KedudukanHukumModule } from './kedudukan-hukum/kedudukan-hukum.module'
import { KpknModule } from './kpkn/kpkn.module'
import { LokasiKerjaModule } from './lokasi-kerja/lokasi-kerja.module'
import { PendidikanModule } from './pendidikan/pendidikan.module'
import { PendidikanTingkatModule } from './pendidikan-tingkat/pendidikan-tingkat.module'
import { SatkerModule } from './satker/satker.module'
import { StatusKepegawaianModule } from './status-kepegawaian/status-kepegawaian.module'
import { StatusPerkawinanModule } from './status-perkawinan/status-perkawinan.module'
import { TempatLahirModule } from './tempat-lahir/tempat-lahir.module'
import { UnorModule } from './unor/unor.module'

@Module({
  imports: [
    AgamaModule,
    AlasanPensiunModule,
    GolonganModule,
    JabatanModule,
    JenisJabatanModule,
    JenisKelaminModule,
    JenisLayananModule,
    JenisPegawaiModule,
    JenisPensiunModule,
    InstansiModule,
    KedudukanHukumModule,
    KpknModule,
    LokasiKerjaModule,
    PendidikanModule,
    PendidikanTingkatModule,
    SatkerModule,
    StatusKepegawaianModule,
    StatusPerkawinanModule,
    TempatLahirModule,
    UnorModule,
  ],
})
export class MasterModule {}
