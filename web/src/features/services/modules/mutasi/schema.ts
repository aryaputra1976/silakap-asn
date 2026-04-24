import { ServiceSchema } from "../../base/schema/schema.types"

export const mutasiSchema: ServiceSchema = {
  fields: [
    {
      name: "nip",
      label: "NIP",
      type: "text",
      required: true,
    },
    {
      name: "unitTujuan",
      label: "Unit Tujuan",
      type: "text",
      required: true,
    },
    {
      name: "jabatanTujuan",
      label: "Jabatan Tujuan",
      type: "text",
    },
    {
      name: "tmtMutasi",
      label: "TMT Mutasi",
      type: "date",
      required: true,
    },
    {
      name: "alasanMutasi",
      label: "Alasan Mutasi",
      type: "textarea",
    },
  ],
}
