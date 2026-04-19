import { AsnListDto } from "../dto/asn-list.dto"
import { AsnDetailDto } from "../dto/asn-detail.dto"

export class AsnMapper {

  static toList(asn: any): AsnListDto {

    return {
      id: BigInt(asn.id),
      nip: asn.nip,
      nama: asn.nama,
      statusAsn: asn.statusAsn ?? null,

      /* GOLONGAN */

      golongan:
        asn.golonganAktif?.nama ?? null,

      /* JABATAN */

      jabatan:
        asn.jabatan?.nama ??
        asn.jenisJabatan?.nama ??
        null,

      /* UNIT KERJA */

      unitKerja:
        asn.unor?.nama ?? null
    }

  }

  static toDetail(asn: any): AsnDetailDto {

    return {
      id: BigInt(asn.id),
      nip: asn.nip,
      nama: asn.nama,
      statusAsn: asn.statusAsn ?? null,

      golongan:
        asn.golonganAktif?.nama ?? null,

      jabatan:
        asn.jabatan?.nama ??
        asn.jenisJabatan?.nama ??
        null,

      unitKerja:
        asn.unor?.nama ?? null
    }

  }

}