"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { NotificationType } from "@prisma/client"

export async function getNotifications() {
  const session = await requireAuth()
  return prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  })
}

export async function markNotificationRead(id: string) {
  const session = await requireAuth()
  await prisma.notification.update({
    where: { id, userId: session.userId },
    data: { isRead: true },
  })
}

export async function markAllNotificationsRead() {
  const session = await requireAuth()
  await prisma.notification.updateMany({
    where: { userId: session.userId, isRead: false },
    data: { isRead: true },
  })
}

// Utility: Create a notification (called from server actions)
export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
}) {
  return prisma.notification.create({
    data: { userId, type, title, message, link },
  })
}
