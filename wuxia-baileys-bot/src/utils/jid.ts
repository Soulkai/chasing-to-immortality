import type { proto, WASocket } from '@whiskeysockets/baileys'

export type SenderIdentity = {
  chatJid: string
  senderJid: string
  senderPhone: string
  isGroup: boolean
  pushName?: string
}

export function normalizeWhatsAppId(jidOrNumber: string | undefined | null): string {
  if (!jidOrNumber) return ''
  const beforeAt = jidOrNumber.split('@')[0] ?? jidOrNumber
  const withoutDevice = beforeAt.split(':')[0] ?? beforeAt
  return withoutDevice.replace(/\D/g, '')
}

export function isGroupJid(jid: string | undefined | null): boolean {
  return Boolean(jid?.endsWith('@g.us'))
}

export function getSenderIdentity(message: proto.IWebMessageInfo): SenderIdentity | null {
  const chatJid = message.key.remoteJid
  if (!chatJid) return null

  const group = isGroupJid(chatJid)
  const senderJid = group ? message.key.participant ?? '' : message.key.remoteJid ?? ''
  const senderPhone = normalizeWhatsAppId(senderJid)

  if (!senderPhone || !senderJid) return null

  return {
    chatJid,
    senderJid,
    senderPhone,
    isGroup: group,
    pushName: message.pushName ?? undefined
  }
}

export function isFromMe(message: proto.IWebMessageInfo): boolean {
  return Boolean(message.key.fromMe)
}

export async function safeSendText(sock: WASocket, jid: string, text: string, quoted?: proto.IWebMessageInfo) {
  return sock.sendMessage(jid, { text }, quoted ? { quoted } : undefined)
}
