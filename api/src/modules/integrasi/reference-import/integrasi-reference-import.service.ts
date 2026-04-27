const jenisJabatanIdMap: Record<JabatanJenis, number> = {
  STRUKTURAL: 1,
  FUNGSIONAL: 2,
  PELAKSANA: 3,
};

const kodePrefixMap: Record<JabatanJenis, string> = {
  STRUKTURAL: 'STR',
  FUNGSIONAL: 'JF',
  PELAKSANA: 'JP',
};

return {
  idSiasn: id,
  kode: `${kodePrefixMap[jenis]}-${id}`,
  nama,
  jenis,
  jenisJabatanId: jenisJabatanIdMap[jenis],
  eselonId:
    jenis === 'STRUKTURAL'
      ? this.cleanString(
          this.pick(record, ['Eselon_id', 'eselon_id', 'ESELON_ID']),
        )
      : null,
  jenjang:
    jenis === 'FUNGSIONAL'
      ? this.cleanString(this.pick(record, ['JENJANG', 'Jenjang', 'jenjang']))
      : null,
  bup:
    jenis === 'FUNGSIONAL'
      ? this.cleanNumber(this.pick(record, ['BUP', 'Bup', 'bup']))
      : null,
  unorNama:
    jenis === 'STRUKTURAL'
      ? this.cleanString(
          this.pick(record, ['Nama_unor', 'nama_unor', 'NAMA_UNOR']),
        )
      : null,
};