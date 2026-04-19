import { Processor, Process } from '@nestjs/bull'
import { Job } from 'bull'
import { PrismaService } from '@/prisma/prisma.service'

@Processor('notification')
export class NotificationProcessor {

  constructor(private prisma: PrismaService) {}

  @Process('service-event')
  async handle(job: Job) {

    const { eventType, payload } = job.data

    switch (eventType) {

      case 'service.submitted':
        await this.notifyVerifier(payload)
        break

      case 'service.verified':
        await this.notifyApprover(payload)
        break

      case 'service.approved':
        await this.notifyPegawai(payload)
        break

      case 'service.returned':
        await this.notifyPegawai(payload)
        break

      default:
        break

    }

  }

  private async notifyVerifier(payload: any) {

    await this.prisma.silakapNotification.create({
      data: {
        userId: BigInt(payload.verifierUserId),
        title: 'Usulan Layanan Masuk',
        message: `Ada usulan ${payload.jenisLayanan} yang perlu diverifikasi`
      }
    })

  }

  private async notifyApprover(payload: any) {

    await this.prisma.silakapNotification.create({
      data: {
        userId: BigInt(payload.approverUserId),
        title: 'Usulan Diverifikasi',
        message: `Usulan ${payload.jenisLayanan} menunggu persetujuan`
      }
    })

  }

  private async notifyPegawai(payload: any) {

    await this.prisma.silakapNotification.create({
      data: {
        userId: BigInt(payload.pegawaiId),
        title: 'Status Usulan Berubah',
        message: `Status usulan ${payload.jenisLayanan} Anda berubah`
      }
    })

  }

}
