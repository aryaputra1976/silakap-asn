import { prisma } from '@/core/prisma/prisma.client'

export class NotificationsQueryService {

  async list(userId: bigint) {

    return prisma.silakapNotification.findMany({

      where: {
        userId
      },

      orderBy: {
        createdAt: 'desc'
      }

    })

  }

  async unreadCount(userId: bigint) {

    return prisma.silakapNotification.count({

      where: {
        userId,
        isRead: false
      }

    })

  }

}
