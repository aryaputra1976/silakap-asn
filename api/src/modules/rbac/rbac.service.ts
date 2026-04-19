import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { MASTER_PERMISSION_REGISTRY } from '../../core/constants/master-permissions.registry'

@Injectable()
export class RbacService {
  constructor(private prisma: PrismaService) {}

  /**
   * Ambil semua permission user dari role
   */
  async getUserPermissions(userId: bigint): Promise<string[]> {
    const roles = await this.prisma.silakapUserRole.findMany({
      where: { userId: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    })

    const perms = new Set<string>()

    for (const r of roles) {
      for (const p of r.role.permissions) {
        perms.add(p.permission.code)
      }
    }

    // ⭐ SUPER ADMIN fallback
    if (perms.size === 0) {
      perms.add('*')
    }

    return [...perms]
  }

  /**
   * Cek apakah user punya permission tertentu
   */
  async userHasPermission(
    userId: bigint,
    permission: string,
  ): Promise<boolean> {
    const perms = await this.getUserPermissions(userId)

    if (perms.includes('*')) return true

    return perms.includes(permission)
  }



async syncMasterPermissions() {
  for (const permissions of Object.values(MASTER_PERMISSION_REGISTRY)) {
    for (const code of permissions) {
      await this.prisma.silakapPermission.upsert({
        where: { code },
        update: {},
        create: {
          code,
          name: code.replace(/_/g, ' '),
        },
      })
    }
  }
}  
}