import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import {
  BaseMasterRepository,
  MasterEntity,
  TxClient,
} from '@/modules/master/core/base-master.repository'
import { CreateJenisLayananDto } from './dto/create-jenis-layanan.dto'
import { UpdateJenisLayananDto } from './dto/update-jenis-layanan.dto'
import { QueryJenisLayananDto } from './dto/query-jenis-layanan.dto'

export type JenisLayananEntity = MasterEntity & {
  kode: string
  nama: string
  deskripsi?: string | null
  isActive: boolean
}

@Injectable()
export class JenisLayananRepository extends BaseMasterRepository<
  JenisLayananEntity,
  CreateJenisLayananDto,
  UpdateJenisLayananDto,
  QueryJenisLayananDto
> {
  constructor(prisma: PrismaService) {
    super(prisma)
  }

  protected getModelName(): 'silakapJenisLayanan' {
    return 'silakapJenisLayanan'
  }

  protected getAllowedSortFields(): string[] {
    return ['id', 'kode', 'nama', 'createdAt']
  }

  async findByKode(kode: string, tx?: TxClient) {
    const model = this.getModel(this.getClient(tx))
    return model.findFirst({
      where: {
        kode: { equals: kode },
        deletedAt: null,
      },
    })
  }

  async findByNama(nama: string, tx?: TxClient) {
    const model = this.getModel(this.getClient(tx))
    return model.findFirst({
      where: {
        nama: { equals: nama },
        deletedAt: null,
      },
    })
  }

  async isReferenced(id: bigint, tx?: TxClient): Promise<boolean> {
    const client = this.getClient(tx)

    const [
      usul,
      workflowTransition,
      workflowSla,
      bidang,
      parentDep,
      childDep,
    ] = await Promise.all([
      client.silakapUsulLayanan.count({
        where: { jenisLayananId: id },
      }),
      client.silakapWorkflowTransition.count({
        where: { jenisLayananId: id },
      }),
      client.silakapWorkflowSLA.count({
        where: { jenisLayananId: id },
      }),
      client.silakapLayananBidang.count({
        where: { jenisLayananId: id },
      }),
      client.silakapWorkflowDependency.count({
        where: { parentJenisLayananId: id },
      }),
      client.silakapWorkflowDependency.count({
        where: { childJenisLayananId: id },
      }),
    ])

    return (
      usul > 0 ||
      workflowTransition > 0 ||
      workflowSla > 0 ||
      bidang > 0 ||
      parentDep > 0 ||
      childDep > 0
    )
  }
}
