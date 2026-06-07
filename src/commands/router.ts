import type { proto, WASocket } from '@whiskeysockets/baileys'
import { env } from '../config/env.js'
import { prisma } from '../database/prisma.js'
import { menuText } from './menu.js'
import { activateGroup, isAdmin, isGroupActive } from '../services/activationService.js'
import { getOrCreateUser } from '../services/userService.js'
import { getSenderIdentity, isFromMe, safeSendText } from '../utils/jid.js'
import { extractButtonId, extractReaction, extractText } from '../utils/message.js'
import { closePrompt, findActivePromptByMessageId, parseNumericChoice } from '../services/promptService.js'
import { handleMoralityChoice, handleRollChoice, startRegistration } from '../services/registrationService.js'
import { damageLifeAndMaybeCreateLegacy, getActiveCharacter, sendProfile, setAppearance } from '../services/characterService.js'

function parseCommand(text: string) {
  const trimmed = text.trim()
  if (!trimmed.startsWith(env.prefix)) return null
  const withoutPrefix = trimmed.slice(env.prefix.length).trim()
  const [commandRaw, ...args] = withoutPrefix.split(/\s+/)
  if (!commandRaw) return null
  return {
    command: commandRaw.toLowerCase(),
    args,
    rawArgs: withoutPrefix.slice(commandRaw.length).trim()
  }
}

async function ensureAllowed(sock: WASocket, message: proto.IWebMessageInfo, command: string) {
  const identity = getSenderIdentity(message)
  if (!identity) return null

  if (identity.isGroup && env.requireGroupActivation) {
    const active = await isGroupActive(identity.chatJid)
    const canActivate = command === 'ativarbot' && isAdmin(identity.senderPhone)
    if (!active && !canActivate) return null
  }

  return identity
}

async function handlePromptAnswer(sock: WASocket, message: proto.IWebMessageInfo, value: number, promptMessageId?: string): Promise<boolean> {
  const identity = getSenderIdentity(message)
  if (!identity) return false

  let prompt = promptMessageId ? await findActivePromptByMessageId(promptMessageId) : null

  if (!prompt) {
    const user = await getOrCreateUser(identity.senderPhone, identity.pushName)
    prompt = await prisma.interactivePrompt.findFirst({
      where: {
        userId: user.id,
        chatJid: identity.chatJid,
        status: 'ACTIVE'
      },
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    })
  }

  if (!prompt) return false
  if (prompt.user.whatsappId !== identity.senderPhone) return false

  const payload = prompt.payload as any
  const options = Array.isArray(payload.options) ? payload.options as number[] : []
  if (!options.includes(value)) {
    await safeSendText(sock, identity.chatJid, `❌ Resposta inválida. Escolha: ${options.join(', ')}`, message)
    return true
  }

  await closePrompt(prompt.id)

  if (prompt.promptType === 'REGISTER_ROLL_CONFIRM') {
    await handleRollChoice(sock, identity.chatJid, payload.flowId, value)
    return true
  }

  if (prompt.promptType === 'MORALITY_QUESTION') {
    await handleMoralityChoice(sock, identity.chatJid, payload.flowId, value)
    return true
  }

  return false
}

export async function routeMessage(sock: WASocket, message: proto.IWebMessageInfo) {
  if (isFromMe(message)) return
  if (!message.message) return

  const reaction = extractReaction(message)
  if (reaction) {
    const value = parseNumericChoice(reaction.emoji)
    if (value) await handlePromptAnswer(sock, message, value, reaction.targetMessageId)
    return
  }

  const buttonId = extractButtonId(message)
  if (buttonId) {
    const identity = getSenderIdentity(message)
    if (!identity) return
    const user = await getOrCreateUser(identity.senderPhone, identity.pushName)
    if (buttonId === 'profile:attributes') {
      await sendProfile(sock, identity.chatJid, user.id, message)
      return
    }
    if (buttonId === 'profile:inventory') {
      await safeSendText(sock, identity.chatJid, '🎒 Inventário ainda será implementado na próxima fase.', message)
      return
    }
    if (buttonId === 'profile:wallet') {
      await safeSendText(sock, identity.chatJid, '💰 Carteira ainda será implementada na próxima fase.', message)
      return
    }
    if (buttonId.startsWith('menu:')) {
      await safeSendText(sock, identity.chatJid, menuText, message)
      return
    }
  }

  const text = extractText(message)
  if (!text) return

  const numericChoice = parseNumericChoice(text)
  if (numericChoice) {
    const handled = await handlePromptAnswer(sock, message, numericChoice)
    if (handled) return
  }

  const parsed = parseCommand(text)
  if (!parsed) return

  const identity = await ensureAllowed(sock, message, parsed.command)
  if (!identity) return

  const user = await getOrCreateUser(identity.senderPhone, identity.pushName)

  await prisma.commandLog.create({
    data: {
      chatJid: identity.chatJid,
      senderJid: identity.senderJid,
      senderPhone: identity.senderPhone,
      command: parsed.command,
      rawText: text
    }
  })

  switch (parsed.command) {
    case 'ativarbot': {
      if (!identity.isGroup) {
        await safeSendText(sock, identity.chatJid, '❌ Use !ativarbot dentro do grupo que deseja liberar.', message)
        return
      }
      if (!isAdmin(identity.senderPhone)) {
        await safeSendText(sock, identity.chatJid, '⛔ Apenas o administrador global pode ativar o bot neste grupo.', message)
        return
      }
      await activateGroup(identity.chatJid, identity.senderPhone)
      await safeSendText(sock, identity.chatJid, '✅ Bot ativado neste grupo.\nOs caminhos do Dao agora estão abertos aqui.', message)
      return
    }

    case 'menu': {
      await sock.sendMessage(identity.chatJid, {
        text: menuText,
        footer: 'Caminho do Dao',
        buttons: [
          { buttonId: 'menu:personagem', buttonText: { displayText: '👤 Personagem' }, type: 1 },
          { buttonId: 'menu:cultivo', buttonText: { displayText: '🧘 Cultivo' }, type: 1 },
          { buttonId: 'menu:mundo', buttonText: { displayText: '🌍 Mundo' }, type: 1 }
        ],
        headerType: 1
      } as any, { quoted: message })
      return
    }

    case 'registrar': {
      const parts = parsed.rawArgs.split('/').map((part) => part.trim()).filter(Boolean)
      if (parts.length < 2) {
        await safeSendText(sock, identity.chatJid, '❌ Formato correto:\n!registrar Nome do Personagem / Sexo\n\nExemplo:\n!registrar Long Wei / Masculino', message)
        return
      }
      const [name, sex] = parts
      await startRegistration(sock, identity.chatJid, user.id, name, sex, message)
      return
    }

    case 'perfil': {
      await sendProfile(sock, identity.chatJid, user.id, message)
      return
    }

    case 'setaparencia': {
      const url = parsed.rawArgs.trim()
      if (!url) {
        await safeSendText(sock, identity.chatJid, '❌ Use: !setaparencia <link>', message)
        return
      }
      await setAppearance(sock, identity.chatJid, user.id, url, message)
      return
    }

    case 'vidas': {
      const character = await getActiveCharacter(user.id)
      if (!character) {
        await safeSendText(sock, identity.chatJid, '❌ Você ainda não tem personagem.', message)
        return
      }
      await safeSendText(sock, identity.chatJid, `🕯️ Vidas de ${character.name}: ${character.lives}/${character.maxLives}\nMortes acumuladas: ${character.deaths}`, message)
      return
    }

    case 'testemorte': {
      if (!isAdmin(identity.senderPhone)) {
        await safeSendText(sock, identity.chatJid, '⛔ Comando de teste apenas para admin.', message)
        return
      }
      await damageLifeAndMaybeCreateLegacy(sock, identity.chatJid, user.id)
      return
    }


    case 'status':
    case 'atributos': {
      await sendProfile(sock, identity.chatJid, user.id, message)
      return
    }

    case 'inventario':
    case 'equipar':
    case 'usar':
    case 'conquistas': {
      await safeSendText(sock, identity.chatJid, '🎒 Sistema de personagem/inventário será implementado na próxima fase.', message)
      return
    }

    case 'cultivar':
    case 'romper':
    case 'tecnicas':
    case 'aprender':
    case 'epifania':
    case 'dao': {
      await safeSendText(sock, identity.chatJid, '🧘 Sistema de cultivo será implementado na próxima fase.', message)
      return
    }

    case 'explorar':
    case 'andar':
    case 'viajar':
    case 'local':
    case 'mapa':
    case 'coletar':
    case 'cacar':
    case 'caçar':
    case 'dungeon':
    case 'ruina':
    case 'evento': {
      await safeSendText(sock, identity.chatJid, '🌍 Sistema de mundo aberto será implementado na próxima fase.', message)
      return
    }

    case 'duelar':
    case 'atacar':
    case 'usar_tecnica':
    case 'fugir':
    case 'arena': {
      await safeSendText(sock, identity.chatJid, '⚔️ Sistema de combate será implementado na próxima fase.', message)
      return
    }

    case 'conversar':
    case 'trocar':
    case 'bloquear':
    case 'amigos':
    case 'encontros': {
      await safeSendText(sock, identity.chatJid, '💬 Sistema social global será implementado na próxima fase.', message)
      return
    }

    case 'criarseita':
    case 'seita': {
      await safeSendText(sock, identity.chatJid, '🛕 Sistema de seitas será implementado na próxima fase.', message)
      return
    }

    case 'saldo':
    case 'carteira':
    case 'loja':
    case 'comprar':
    case 'vender':
    case 'mercado':
    case 'leilao':
    case 'lance': {
      await safeSendText(sock, identity.chatJid, '💰 Sistema econômico será implementado na próxima fase.', message)
      return
    }

    case 'profissao':
    case 'aprender_profissao':
    case 'alquimia':
    case 'forja':
    case 'formacao':
    case 'talismas':
    case 'cozinha':
    case 'domar':
    case 'receitas': {
      await safeSendText(sock, identity.chatJid, '🛠️ Sistema de profissões será implementado na próxima fase.', message)
      return
    }

    case 'destino':
    case 'karma':
    case 'sorte':
    case 'legado':
    case 'samsara': {
      await safeSendText(sock, identity.chatJid, '🌌 Sistema de destino/karma/legado será expandido na próxima fase.', message)
      return
    }

    case 'rank': {
      await safeSendText(sock, identity.chatJid, '🏆 Sistema de rankings será implementado na próxima fase.', message)
      return
    }

    case 'ajuda':
    case 'regras':
    case 'cooldowns': {
      await safeSendText(sock, identity.chatJid, menuText, message)
      return
    }

    case 'reencarnar': {
      const legacy = await prisma.legacy.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
      if (!legacy) {
        await safeSendText(sock, identity.chatJid, '🌊 Você ainda não possui legado no Samsara.', message)
        return
      }
      await safeSendText(sock, identity.chatJid,
        `🌌 *LOJA DO SAMSARA*\n\n` +
        `Você possui: *${legacy.fatePoints - legacy.spentPoints} Pontos de Destino*\n\n` +
        `1️⃣ Herdar Linhagem Menor — 500 PD\n` +
        `2️⃣ Herdar 10% da riqueza — 700 PD\n` +
        `3️⃣ Herdar uma técnica comum — 800 PD\n` +
        `4️⃣ Herdar histórico nobre — 1.000 PD\n` +
        `5️⃣ Herdar talento parcial — 1.500 PD\n` +
        `6️⃣ Herdar corpo especial fraco — 2.500 PD\n\n` +
        `A compra real será implementada na fase de legado.`, message)
      return
    }

    default: {
      await safeSendText(sock, identity.chatJid, `❔ Comando não reconhecido: !${parsed.command}\nUse !menu para ver os comandos.`, message)
    }
  }
}
