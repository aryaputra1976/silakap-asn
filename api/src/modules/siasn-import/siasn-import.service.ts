import { Injectable } from '@nestjs/common'
import * as XLSX from 'xlsx'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { PegawaiSiasnRow } from './dto/pegawai-siasn-row.interface'
import { mapPegawaiSiasn } from './mapper/siasn/pegawai.mapper'

@Injectable()
export class SiasnImportService {

  constructor(private prisma: PrismaService) {}

  private readonly BATCH_SIZE = 200

  private readonly refConfig = [

    { field:'agamaId', model:'refAgama', kode:'AGAMA ID', nama:'AGAMA NAMA' },

    { field:'jenisKelaminId', model:'refJenisKelamin', kode:'JENIS KELAMIN', nama:'JENIS KELAMIN' },

    { field:'tempatLahirId', model:'refTempatLahir', kode:'TEMPAT LAHIR ID', nama:'TEMPAT LAHIR NAMA' },

    { field:'statusPerkawinanId', model:'refStatusPerkawinan', kode:'JENIS KAWIN ID', nama:'JENIS KAWIN NAMA' },

    { field:'jenisPegawaiId', model:'refJenisPegawai', kode:'JENIS PEGAWAI ID', nama:'JENIS PEGAWAI NAMA' },

    { field:'kedudukanHukumId', model:'refKedudukanHukum', kode:'KEDUDUKAN HUKUM ID', nama:'KEDUDUKAN HUKUM NAMA' },

    { field:'golonganAwalId', model:'refGolongan', kode:'GOL AWAL ID', nama:'GOL AWAL NAMA' },

    { field:'golonganAktifId', model:'refGolongan', kode:'GOL AKHIR ID', nama:'GOL AKHIR NAMA' },

    { field:'pendidikanTingkatId', model:'refPendidikanTingkat', kode:'TINGKAT PENDIDIKAN ID', nama:'TINGKAT PENDIDIKAN NAMA' },

    { field:'pendidikanId', model:'refPendidikan', kode:'PENDIDIKAN ID', nama:'PENDIDIKAN NAMA' },

    { field:'jenisJabatanId', model:'refJenisJabatan', kode:'JENIS JABATAN ID', nama:'JENIS JABATAN NAMA' },

    { field:'jabatanId', model:'refJabatan', kode:'JABATAN ID', nama:'JABATAN NAMA', dependsOn:'jenisJabatanId' },

  ]

  private refCache:Record<string,Map<string,any>> = {}

  // =====================================================
  // UTIL
  // =====================================================

  private readExcel<T = any>(path:string):T[]{

    const workbook = XLSX.readFile(path)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]

    return XLSX.utils.sheet_to_json<T>(sheet)

  }

  private normalizeKode(v:any):string|null{

    if(!v) return null

    return String(v).replace(/^'+/,'').trim()

  }

  private safeEqual(a:any,b:any){

    if(a instanceof Date && b instanceof Date)
      return a.getTime() === b.getTime()

    if(typeof a === 'bigint' || typeof b === 'bigint')
      return BigInt(a ?? 0) === BigInt(b ?? 0)

    return String(a ?? '') === String(b ?? '')

  }

  private hasChanged(existing:any,incoming:any){

    const ignore = ['id','createdAt','updatedAt','rawSiasnJson']

    for(const key of Object.keys(incoming)){

      if(ignore.includes(key)) continue

      if(!this.safeEqual(existing[key],incoming[key])) return true

    }

    return false
  }

  // =====================================================
  // SCAN REFERENCE DARI EXCEL
  // =====================================================

  private scanRefs(rows:any[]){

    const result:Record<string,Map<string,string>> = {}

    for(const cfg of this.refConfig)
      result[cfg.model] = new Map()

    for(const row of rows){

      for(const cfg of this.refConfig){

        const kode = this.normalizeKode(row[cfg.kode])
        if(!kode) continue

        const nama = this.normalizeKode(row[cfg.nama]) ?? kode

        result[cfg.model].set(kode,nama)

      }

    }

    return result
  }

  // =====================================================
  // BULK CREATE REFERENCE
  // =====================================================

  private async buildRefs(rows:any[]){

    const scanned = this.scanRefs(rows)

    for(const cfg of this.refConfig){

      const model = cfg.model
      const map = scanned[model]

      const existing = await (this.prisma as any)[model].findMany({
        select:{kode:true}
      })

      const existingSet = new Set(existing.map((e:any)=>e.kode))

      const createData:any[] = []

      for(const [kode,nama] of map){

        if(existingSet.has(kode)) continue

        createData.push({
          idSiasn:kode,
          kode,
          nama
        })

      }

      if(createData.length){

        await (this.prisma as any)[model].createMany({
          data:createData,
          skipDuplicates:true
        })

      }

    }

  }

  // =====================================================
  // PRELOAD CACHE
  // =====================================================

  private async preloadRefs(){

    this.refCache = {}

    const models = [...new Set(this.refConfig.map(r=>r.model))]

    for(const model of models){

      const rows = await (this.prisma as any)[model].findMany({
        select:{
          id:true,
          kode:true,
          idSiasn:true
        }
      })

      const map = new Map<string,any>()

      for(const r of rows)
        map.set(r.kode,r)

      this.refCache[model] = map

    }

  }

  // =====================================================
  // SYNC REF (CACHE BASED)
  // =====================================================

  private async syncRefs(tx:Prisma.TransactionClient,row:any){

    const result:Record<string,bigint|null> = {}

    for(const cfg of this.refConfig){

      const kode = this.normalizeKode(row[cfg.kode])
      if(!kode) continue

      const cache = this.refCache[cfg.model]

      const ref = cache.get(kode)

      if(ref)
        result[cfg.field] = ref.id

    }

    return result

  }

  // =====================================================
  // IMPORT PEGAWAI V3
  // =====================================================

  async importPegawai(file:Express.Multer.File){

    const rows = this.readExcel<PegawaiSiasnRow>(file.path)

    await this.buildRefs(rows)

    await this.preloadRefs()

    let inserted = 0
    let updated = 0
    let skipped = 0

    const errors:any[] = []

    for(let i=0;i<rows.length;i+=this.BATCH_SIZE){

      const batch = rows.slice(i,i+this.BATCH_SIZE)

      await this.prisma.$transaction(async tx=>{

        for(const row of batch){

          try{

            const mapped = mapPegawaiSiasn(row)

            if(!mapped.nip) throw new Error("NIP kosong")
            if(!mapped.nama) throw new Error("Nama kosong")

            const refIds = await this.syncRefs(tx,row)

            const createData:Prisma.SilakapPegawaiUncheckedCreateInput = {

              ...mapped,
              ...refIds,

              nip:mapped.nip,
              nama:mapped.nama,

              statusAktif:true,

              rawSiasnJson: JSON.parse(JSON.stringify(row))

            }

            const existing = await tx.silakapPegawai.findUnique({
              where:{nip:mapped.nip}
            })

            if(!existing){

              await tx.silakapPegawai.create({
                data:createData
              })

              inserted++
              continue
            }

            const updateData:Prisma.SilakapPegawaiUncheckedUpdateInput = {
              ...createData
            }

            delete (updateData as any).nip

            if(!this.hasChanged(existing,createData)){
              skipped++
              continue
            }

            await tx.silakapPegawai.update({
              where:{nip:mapped.nip},
              data:updateData
            })

            updated++

          }catch(e:any){

            errors.push({
              nip:row['NIP BARU'],
              message:e.message
            })

          }

        }

      })

    }

    return{
      inserted,
      updated,
      skipped,
      failed:errors.length,
      errors
    }

  }

async importRiwayatJabatan(file: Express.Multer.File) {

  const rows = this.readExcel<any>(file.path)

  await this.preloadRefs()

  let inserted = 0
  let updated = 0
  let skipped = 0

  const errors: any[] = []

  for (let i = 0; i < rows.length; i += this.BATCH_SIZE) {

    const batch = rows.slice(i, i + this.BATCH_SIZE)

    await this.prisma.$transaction(async tx => {

      for (const row of batch) {

        try {

          const nip = String(row["NIP BARU"] ?? "").trim()

          if (!nip) throw new Error("NIP kosong")

          const pegawai = await tx.silakapPegawai.findUnique({
            where: { nip }
          })

          if (!pegawai) throw new Error("Pegawai tidak ditemukan")

          const refIds = await this.syncRefs(tx, row)

          const tmt = new Date(row["TMT JABATAN"])

          const existing = await tx.silakapRiwayatJabatan.findFirst({
            where: {
              pegawaiId: pegawai.id,
              tmtJabatan: tmt
            }
          })

          const createData: Prisma.SilakapRiwayatJabatanUncheckedCreateInput = {
            pegawaiId: pegawai.id,
            jenisJabatanId: refIds.jenisJabatanId ?? null,
            jabatanId: refIds.jabatanId ?? null,
            tmtJabatan: tmt,
            rawSiasnJson: JSON.parse(JSON.stringify(row))
          }

          if (!existing) {

            await tx.silakapRiwayatJabatan.create({
              data: createData
            })

            inserted++
            continue

          }

          const updateData: Prisma.SilakapRiwayatJabatanUncheckedUpdateInput = {
            ...createData
          }

          delete (updateData as any).pegawaiId

          if (!this.hasChanged(existing, createData)) {

            skipped++
            continue

          }

          await tx.silakapRiwayatJabatan.update({
            where: { id: existing.id },
            data: updateData
          })

          updated++

        } catch (e: any) {

          errors.push({
            nip: row["NIP BARU"],
            message: e.message
          })

        }

      }

    })

  }

  return { inserted, updated, skipped, failed: errors.length, errors }

}

async importRiwayatPangkat(file: Express.Multer.File) {

  const rows = this.readExcel<any>(file.path)

  await this.preloadRefs()

  let inserted = 0
  let updated = 0
  let skipped = 0

  const errors: any[] = []

  for (let i = 0; i < rows.length; i += this.BATCH_SIZE) {

    const batch = rows.slice(i, i + this.BATCH_SIZE)

    await this.prisma.$transaction(async tx => {

      for (const row of batch) {

        try {

          const nip = String(row["NIP BARU"] ?? "").trim()

          const pegawai = await tx.silakapPegawai.findUnique({
            where: { nip }
          })

          if (!pegawai) throw new Error("Pegawai tidak ditemukan")

          const refIds = await this.syncRefs(tx, row)

          const tmt = new Date(row["TMT GOLONGAN"])

          const existing = await tx.silakapRiwayatPangkat.findFirst({
            where: {
              pegawaiId: pegawai.id,
              tmtPangkat: tmt
            }
          })

          const createData: Prisma.SilakapRiwayatPangkatUncheckedCreateInput = {
            pegawaiId: pegawai.id,
            golonganId: refIds.golonganAktifId!,
            tmtPangkat: tmt,
            rawSiasnJson: JSON.parse(JSON.stringify(row))
          }

          if (!existing) {

            await tx.silakapRiwayatPangkat.create({
              data: createData
            })

            inserted++
            continue

          }

          const updateData: Prisma.SilakapRiwayatPangkatUncheckedUpdateInput = {
            ...createData
          }

          delete (updateData as any).pegawaiId

          if (!this.hasChanged(existing, createData)) {

            skipped++
            continue

          }

          await tx.silakapRiwayatPangkat.update({
            where: { id: existing.id },
            data: updateData
          })

          updated++

        } catch (e: any) {

          errors.push({
            nip: row["NIP BARU"],
            message: e.message
          })

        }

      }

    })

  }

  return { inserted, updated, skipped, failed: errors.length, errors }

}

async importRiwayatPendidikan(file: Express.Multer.File) {

  const rows = this.readExcel<any>(file.path)

  await this.preloadRefs()

  let inserted = 0
  let updated = 0
  let skipped = 0

  const errors: any[] = []

  for (let i = 0; i < rows.length; i += this.BATCH_SIZE) {

    const batch = rows.slice(i, i + this.BATCH_SIZE)

    await this.prisma.$transaction(async tx => {

      for (const row of batch) {

        try {

          const nip = String(row["NIP BARU"] ?? "").trim()

          const pegawai = await tx.silakapPegawai.findUnique({
            where: { nip }
          })

          if (!pegawai) throw new Error("Pegawai tidak ditemukan")

          const refIds = await this.syncRefs(tx, row)

          const existing = await tx.silakapRiwayatPendidikan.findFirst({
            where: {
              pegawaiId: pegawai.id,
              pendidikanId: refIds.pendidikanId
            }
          })

          const createData: Prisma.SilakapRiwayatPendidikanUncheckedCreateInput = {
            pegawaiId: pegawai.id,
            pendidikanId: refIds.pendidikanId!,
            pendidikanTingkatId: refIds.pendidikanTingkatId ?? null,
            rawSiasnJson: JSON.parse(JSON.stringify(row))
          }

          if (!existing) {

            await tx.silakapRiwayatPendidikan.create({
              data: createData
            })

            inserted++
            continue

          }

          const updateData: Prisma.SilakapRiwayatPendidikanUncheckedUpdateInput = {
            ...createData
          }

          delete (updateData as any).pegawaiId

          if (!this.hasChanged(existing, createData)) {

            skipped++
            continue

          }

          await tx.silakapRiwayatPendidikan.update({
            where: { id: existing.id },
            data: updateData
          })

          updated++

        } catch (e: any) {

          errors.push({
            nip: row["NIP BARU"],
            message: e.message
          })

        }

      }

    })

  }

  return { inserted, updated, skipped, failed: errors.length, errors }

}

async getLogs() {

  return this.prisma.silakapImportLog.findMany({
    orderBy: {
      createdAt: "desc"
    },
    take: 100
  })

}

}