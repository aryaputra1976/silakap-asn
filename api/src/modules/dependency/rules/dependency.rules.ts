export function getDependencyRules(
  layananCode: string
): string[] {

  const rules: Record<string, string[]> = {

    PENSIUN: [
      "DATA_PEGAWAI",
      "RIWAYAT_PANGKAT",
      "RIWAYAT_JABATAN"
    ],

    MUTASI: [
      "DATA_PEGAWAI",
      "RIWAYAT_PANGKAT"
    ]

  }

  return rules[layananCode] || []

}