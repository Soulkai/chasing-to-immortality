import { env } from '../config/env.js'
import { prisma } from '../database/prisma.js'
import { normalizeWhatsAppId } from '../utils/jid.js'

export function isAdmin(senderPhone: string): boolean {
  const normalized = normalizeWhatsAppId(senderPhone)
  return env.adminNumbers.includes(normalized)
}

export async function isGroupActive(chatJid: string): Promise<boolean> {
  if (!env.requireGroupActivation) return true
  const activation = await prisma.botGroupActivation.findUnique({ where: { chatJid } })
  return Boolean(activation?.isActive)
}

export async function activateGroup(chatJid: string, activatedBy: string) {
  return prisma.botGroupActivation.upsert({
    where: { chatJid },
    create: { chatJid, activatedBy, isActive: true },
    update: { activatedBy, isActive: true, activatedAt: new Date() }
  })
}
