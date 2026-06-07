import type { proto } from '@whiskeysockets/baileys'

export function extractText(message: proto.IWebMessageInfo): string {
  const content = message.message
  if (!content) return ''

  return (
    content.conversation ??
    content.extendedTextMessage?.text ??
    content.imageMessage?.caption ??
    content.videoMessage?.caption ??
    content.buttonsResponseMessage?.selectedDisplayText ??
    content.buttonsResponseMessage?.selectedButtonId ??
    content.listResponseMessage?.singleSelectReply?.selectedRowId ??
    content.templateButtonReplyMessage?.selectedId ??
    ''
  ).trim()
}

export function extractButtonId(message: proto.IWebMessageInfo): string | null {
  const content = message.message
  return (
    content?.buttonsResponseMessage?.selectedButtonId ??
    content?.listResponseMessage?.singleSelectReply?.selectedRowId ??
    content?.templateButtonReplyMessage?.selectedId ??
    null
  )
}

export function extractReaction(message: proto.IWebMessageInfo): { targetMessageId: string; emoji: string } | null {
  const reaction = message.message?.reactionMessage
  const targetMessageId = reaction?.key?.id
  const emoji = reaction?.text

  if (!targetMessageId || !emoji) return null

  return {
    targetMessageId,
    emoji
  }
}
