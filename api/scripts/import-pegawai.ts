import { PrismaClient, StatusAsn } from "@prisma/client"
import * as XLSX from "xlsx"

const prisma = new PrismaClient()
const FILE = "./data/import/data-utama.xlsx"

function cleanString(val:any){
 if(!val) return null
 return String(val).replace(/'/g,"").trim()
}

function cleanNumber(val:any){
 if(!val) return null
 const n = Number(val)
 return isNaN(n)?null:n
}

function toDate(val:any){
 if(!val) return null

 if(typeof val === "number"){
  const epoch = new Date(Date.UTC(1899,11,30))
  return new Date(epoch.getTime()+val*86400000)
 }

 const d = new Date(val)
 return isNaN(d.getTime())?null:d
}

function mapId(map:Map<string,bigint>, val:any){
 if(!val) return null
 return map.get(String(val)) ?? null
}

async function loadRefMap(model:any){
 const rows = await model.findMany({
  select:{id:true,idSiasn:true}
 })

 const map = new Map<string,bigint>()

 rows.forEach((r:any)=>{
  if(r.idSiasn) map.set(String(r.idSiasn), r.id)
 })

 return map
}

async function main(){

 console.log("🧹 clearing pegawai table")
 await prisma.silakapPegawai.deleteMany()

 const workbook = XLSX.readFile(FILE)
 const sheet = workbook.Sheets[workbook.SheetNames[0]]
 const rows:any[] = XLSX.utils.sheet_to_json(sheet)

 console.log("rows:",rows.length)

 const [
  jkMap,
  tempatMap,
  agamaMap,
  kawinMap,
  jenisPegawaiMap,
  kedudukanMap,
  golMap,
  jenisJabMap,
  jabatanMap,
  pendidikanTingkatMap,
  pendidikanMap,
  kpknMap,
  lokasiMap,
  unorMap,
  instansiMap,
  satkerMap
 ] = await Promise.all([
  loadRefMap(prisma.refJenisKelamin),
  loadRefMap(prisma.refTempatLahir),
  loadRefMap(prisma.refAgama),
  loadRefMap(prisma.refStatusPerkawinan),
  loadRefMap(prisma.refJenisPegawai),
  loadRefMap(prisma.refKedudukanHukum),
  loadRefMap(prisma.refGolongan),
  loadRefMap(prisma.refJenisJabatan),
  loadRefMap(prisma.refJabatan),
  loadRefMap(prisma.refPendidikanTingkat),
  loadRefMap(prisma.refPendidikan),
  loadRefMap(prisma.refKpkn),
  loadRefMap(prisma.refLokasiKerja),
  loadRefMap(prisma.refUnor),
  loadRefMap(prisma.refInstansi),
  loadRefMap(prisma.refSatker)
 ])

 const batchSize = 500

 for(let i=0;i<rows.length;i+=batchSize){

  const batch = rows.slice(i,i+batchSize)

  const data = batch.map(r=>({

   siasnId: cleanString(r["PNS ID"]),

   nip: cleanString(r["NIP BARU"])!,
   nipLama: cleanString(r["NIP LAMA"]),
   nik: cleanString(r["NIK"]),

   nama: cleanString(r["NAMA"])!,
   gelarDepan: cleanString(r["GELAR DEPAN"]),
   gelarBelakang: cleanString(r["GELAR BELAKANG"]),

   tempatLahirId: mapId(tempatMap,r["TEMPAT LAHIR ID"]),
   tempatLahir: cleanString(r["TEMPAT LAHIR NAMA"]),
   tanggalLahir: toDate(r["TANGGAL LAHIR"]),

   jenisKelaminId: mapId(jkMap,r["JENIS KELAMIN"]),
   agamaId: mapId(agamaMap,r["AGAMA ID"]),
   statusPerkawinanId: mapId(kawinMap,r["JENIS KAWIN ID"]),
   jenisPegawaiId: mapId(jenisPegawaiMap,r["JENIS PEGAWAI ID"]),
   jenisPegawaiNama: cleanString(r["JENIS PEGAWAI NAMA"]),

   kedudukanHukumId: mapId(kedudukanMap,r["KEDUDUKAN HUKUM ID"]),
   statusCpnsPns: cleanString(r["STATUS CPNS PNS"]),
   statusAsn: r["STATUS ASN"] as StatusAsn,

   golonganAwalId: mapId(golMap,r["GOL AWAL ID"]),
   golonganAktifId: mapId(golMap,r["GOL AKHIR ID"]),
   tmtGolongan: toDate(r["TMT GOLONGAN"]),

   mkTahun: cleanNumber(r["MK TAHUN"]),
   mkBulan: cleanNumber(r["MK BULAN"]),

   jenisJabatanId: mapId(jenisJabMap,r["JENIS JABATAN ID"]),
   jabatanId: mapId(jabatanMap,r["JABATAN ID"]),
   tmtJabatan: toDate(r["TMT JABATAN"]),

   pendidikanTingkatId: mapId(pendidikanTingkatMap,r["TINGKAT PENDIDIKAN ID"]),
   pendidikanId: mapId(pendidikanMap,r["PENDIDIKAN ID"]),
   tahunLulus: cleanNumber(r["TAHUN LULUS"]),
   namaSekolahTerakhir: cleanString(r["NAMA SEKOLAH"]),

   alamat: cleanString(r["ALAMAT"]),
   noHp: cleanString(r["NOMOR HP"]),
   email: cleanString(r["EMAIL"]),
   emailPemerintah: cleanString(r["EMAIL GOV"]),

   npwpNomor: cleanString(r["NPWP NOMOR"]),
   bpjsNomor: cleanString(r["BPJS"]),
   kartuAsnVirtual: cleanString(r["KARTU ASN VIRTUAL"]),

   skCpnsNomor: cleanString(r["NOMOR SK CPNS"]),
   skCpnsTanggal: toDate(r["TANGGAL SK CPNS"]),
   tmtCpns: toDate(r["TMT CPNS"]),

   skPnsNomor: cleanString(r["NOMOR SK PNS"]),
   skPnsTanggal: toDate(r["TANGGAL SK PNS"]),
   tmtPns: toDate(r["TMT PNS"]),

   kpknId: mapId(kpknMap,r["KPKN ID"]),
   lokasiKerjaId: mapId(lokasiMap,r["LOKASI KERJA ID"]),
   unorId: mapId(unorMap,r["UNOR ID"]),

   instansiIndukId: mapId(instansiMap,r["INSTANSI INDUK ID"]),
   instansiKerjaId: mapId(instansiMap,r["INSTANSI KERJA ID"]),

   satkerIndukId: mapId(satkerMap,r["SATUAN KERJA INDUK ID"]),
   satkerKerjaId: mapId(satkerMap,r["SATUAN KERJA KERJA ID"]),

   isValidNik: r["IS VALID NIK"]===1,
   flagIkd: r["FLAG IKD"]===1

  }))

  await prisma.silakapPegawai.createMany({
   data,
   skipDuplicates:true
  })

  console.log("batch", i/batchSize+1,"done")
 }

 console.log("import selesai")
}

main()
