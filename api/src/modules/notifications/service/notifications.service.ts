import { prisma } from '@/core/prisma/prisma.client'

export class NotificationsService {

  async create(
    userId: bigint,
    title: string,
    message: string
  ) {

    return prisma.silakapNotification.create({
      data: {
        userId,
        title,
        message
      }
    })

  }

  async markAsRead(id: bigint) {

    return prisma.silakapNotification.update({
      where: { id },
      data: {
        isRead: true
      }
    })

  }

}
