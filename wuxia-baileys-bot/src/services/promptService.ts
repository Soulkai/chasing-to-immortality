import fs from 'node:fs'
import path from 'node:path'
import type { proto, WASocket } from '@whiskeysockets/baileys'
import { prisma } from '../database/prisma.js'

export const numberEmojis: Record<string, number> = {
  '1️⃣': 1,
  '2️⃣': 2,
  '3️⃣': 3,
  '4️⃣': 4,
  '5️⃣': 5,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '✅': 1,
  '🔁': 2,
  '❌': 2
}

export function parseNumericChoice(input: string): number | null {
  const clean = input.trim()
  if (numberEmojis[clean]) return numberEmojis[clean]
  const digit = clean.match(/[1-5]/)?.[0]
  return digit ? Number(digit) : null
}

type PromptPayload = {
  options: number[]
  flowId?: string
  questionIndex?: number
  [key: string]: unknown
}

const questionCardPath = path.resolve('assets/cards/question.png')

export async function sendReactionPrompt(
  sock: WASocket,
  chatJid: string,
  userId: string,
  promptType: string,
  caption: string,
  payload: PromptPayload,
  quoted?: proto.IWebMessageInfo
) {
  const image = fs.existsSync(questionCardPath) ? fs.readFileSync(questionCardPath) : undefined
  const sent = image
    ? await sock.sendMessage(chatJid, { image, caption }, quoted ? { quoted } : undefined)
    : await sock.sendMessage(chatJid, { text: caption }, quoted ? { quoted } : undefined)

  const messageId = sent.key.id
  if (!messageId) return sent

  await prisma.interactivePrompt.create({
    data: {
      userId,
      chatJid,
      messageId,
      promptType,
      payload,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30)
    }
  })

  return sent
}

export async function findActivePromptByMessageId(messageId: string) {
  const prompt = await prisma.interactivePrompt.findUnique({
    where: { messageId },
    include: { user: true }
  })

  if (!prompt || prompt.status !== 'ACTIVE') return null
  if (prompt.expiresAt && prompt.expiresAt.getTime() < Date.now()) {
    await prisma.interactivePrompt.update({ where: { id: prompt.id }, data: { status: 'EXPIRED' } })
    return null
  }

  return prompt
}

export async function closePrompt(id: string) {
  await prisma.interactivePrompt.update({
    where: { id },
    data: { status: 'ANSWERED', answeredAt: new Date() }
  })
}
