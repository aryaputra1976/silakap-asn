export interface WorkforceTreeNode {

  id: number

  parentId: number | null

  namaUnor: string

  kebutuhanAsn: number

  asnEksisting: number

  pensiun5Tahun: number

  gapAsn: number

  rekomendasiFormasi: number

  children?: WorkforceTreeNode[]

}