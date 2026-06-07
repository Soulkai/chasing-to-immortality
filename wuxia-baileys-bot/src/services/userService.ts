import { prisma } from '../database/prisma.js'

export async function getOrCreateUser(whatsappId: string, displayName?: string) {
  return prisma.user.upsert({
    where: { whatsappId },
    create: { whatsappId, displayName },
    update: displayName ? { displayName } : {}
  })
}
