import { ServiceSchema } from "../../base/schema/schema.types"

export const jabatanSchema: ServiceSchema = {
  fields: [
    {
      name: "nip",
      label: "NIP",
      type: "text",
      required: true,
    },
    {
      name: "jenisJabatanUsulan",
      label: "Jenis Jabatan Usulan",
      type: "text",
      required: true,
    },
    {
      name: "namaJabatanUsulan",
      label: "Nama Jabatan Usulan",
      type: "text",
      required: true,
    },
    {
      name: "tmtJabatan",
      label: "TMT Jabatan",
      type: "date",
      required: true,
    },
    {
      name: "nomorSkJabatan",
      label: "Nomor SK Jabatan",
      type: "text",
    },
    {
      name: "keterangan",
      label: "Keterangan Jabatan",
      type: "textarea",
    },
  ],
}
