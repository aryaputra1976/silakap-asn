import { ServiceSchema } from "../../base/schema/schema.types"

export const pensiunSchema: ServiceSchema = {
  fields: [
    {
      name: "nip",
      label: "NIP",
      type: "text",
      required: true,
    },
    {
      name: "jenisPensiun",
      label: "Jenis Pensiun",
      type: "select",
      required: true,
      options: [
        { label: "BUP", value: "BUP" },
        { label: "APS", value: "APS" },
        { label: "Janda/Duda", value: "JANDA_DUDA" },
      ],
    },
    {
      name: "tmtPensiun",
      label: "TMT Pensiun",
      type: "date",
      required: true,
    },
  ],

  documents: [
    {
      code: "sk_cpns",
      label: "SK CPNS",
      required: true,
    },
    {
      code: "sk_pns",
      label: "SK PNS",
      required: true,
    },
    {
      code: "sk_pangkat",
      label: "SK Pangkat Terakhir",
    },
    {
      code: "drh",
      label: "Daftar Riwayat Hidup",
    },
  ],
}