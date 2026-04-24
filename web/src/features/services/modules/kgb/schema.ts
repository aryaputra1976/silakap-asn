import { ServiceSchema } from "../../base/schema/schema.types"

export const kgbSchema: ServiceSchema = {
  fields: [
    {
      name: "nip",
      label: "NIP",
      type: "text",
      required: true,
    },
    {
      name: "tmtKgb",
      label: "TMT KGB",
      type: "date",
      required: true,
    },
    {
      name: "masaKerjaTahun",
      label: "Masa Kerja Tahun",
      type: "number",
      required: true,
    },
    {
      name: "masaKerjaBulan",
      label: "Masa Kerja Bulan",
      type: "number",
    },
    {
      name: "nomorSk",
      label: "Nomor SK",
      type: "text",
    },
    {
      name: "keterangan",
      label: "Keterangan KGB",
      type: "textarea",
    },
  ],
}
