import { Processor, Process } from '@nestjs/bull'
import { Job } from 'bull'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

/**
 * Queue processor untuk membersihkan audit log lama
 * sesuai kebijakan retensi data.
 */
@Injectable()
@Processor('retention')
export class RetentionProcessor {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Job: hapus audit log lebih lama dari X hari
   */
  @Process('cleanup-audit-log')
  async handleCleanupAuditLog(_job: Job): Promise<void> {
    // ================= KONFIGURASI RETENSI =================
    const retentionDays = 90

    // ================= HITUNG BATAS WAKTU =================
    const thresholdDate = new Date()
    thresholdDate.setDate(thresholdDate.getDate() - retentionDays)

    // ================= EKSEKUSI DELETE =================
    await this.prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: thresholdDate,
        },
      },
    })
  }
}
