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
import {
  attack, breakthrough, buyItem, completeMission, createSect, craft, cultivate, destinyInfo, explore, flee,
  learnTechnique, npcEncounter, profession, ranks, showInventory, showLocation, showMap, showMission, showSect,
  showShop, showTechniques, showWallet, travel, useItem
} from '../services/gameplayService.js'

function parseCommand(text: string) {
  const trimmed = text.trim()
  if (!trimmed.startsWith(env.prefix)) return null
  const withoutPrefix = trimmed.slice(env.prefix.length).trim()
  const [commandRaw, ...args] = withoutPrefix.split(/\s+/)
  if (!commandRaw) return null
  return { command: commandRaw.toLowerCase(), args, rawArgs: withoutPrefix.slice(commandRaw.length).trim() }
}

async function ensureAllowed(_sock: WASocket, message: proto.IWebMessageInfo, command: string) {
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
    prompt = await prisma.interactivePrompt.findFirst({ where: { userId: user.id, chatJid: identity.chatJid, status: 'ACTIVE' }, orderBy: { createdAt: 'desc' }, include: { user: true } })
  }
  if (!prompt) return false
  if (prompt.user.whatsappId !== identity.senderPhone) return false
  const payload = prompt.payload as any
  const options = Array.isArray(payload.options) ? payload.options as number[] : []
  if (!options.includes(value)) { await safeSendText(sock, identity.chatJid, `❌ Resposta inválida. Escolha: ${options.join(', ')}`, message); return true }
  await closePrompt(prompt.id)
  if (prompt.promptType === 'REGISTER_ROLL_CONFIRM') { await handleRollChoice(sock, identity.chatJid, payload.flowId, value); return true }
  if (prompt.promptType === 'MORALITY_QUESTION') { await handleMoralityChoice(sock, identity.chatJid, payload.flowId, value); return true }
  return false
}

export async function routeMessage(sock: WASocket, message: proto.IWebMessageInfo) {
  if (isFromMe(message) || !message.message) return

  const reaction = extractReaction(message)
  if (reaction) {
    const value = parseNumericChoice(reaction.emoji)
    if (value) await handlePromptAnswer(sock, message, value, reaction.targetMessageId)
    return
  }

  const buttonId = extractButtonId(message)
  if (buttonId) {
    const identity = getSenderIdentity(message); if (!identity) return
    const user = await getOrCreateUser(identity.senderPhone, identity.pushName)
    if (buttonId === 'profile:attributes') return sendProfile(sock, identity.chatJid, user.id, message)
    if (buttonId === 'profile:inventory') return showInventory(sock, identity.chatJid, user.id, message)
    if (buttonId === 'profile:wallet') return showWallet(sock, identity.chatJid, user.id, message)
    if (buttonId.startsWith('menu:')) return safeSendText(sock, identity.chatJid, menuText, message)
  }

  const text = extractText(message)
  if (!text) return
  const numericChoice = parseNumericChoice(text)
  if (numericChoice) { const handled = await handlePromptAnswer(sock, message, numericChoice); if (handled) return }
  const parsed = parseCommand(text)
  if (!parsed) return
  const identity = await ensureAllowed(sock, message, parsed.command)
  if (!identity) return
  const user = await getOrCreateUser(identity.senderPhone, identity.pushName)

  await prisma.commandLog.create({ data: { chatJid: identity.chatJid, senderJid: identity.senderJid, senderPhone: identity.senderPhone, command: parsed.command, rawText: text } })

  switch (parsed.command) {
    case 'ativarbot': {
      if (!identity.isGroup) return safeSendText(sock, identity.chatJid, '❌ Use !ativarbot dentro do grupo que deseja liberar.', message)
      if (!isAdmin(identity.senderPhone)) return safeSendText(sock, identity.chatJid, '⛔ Apenas o administrador global pode ativar o bot neste grupo.', message)
      await activateGroup(identity.chatJid, identity.senderPhone)
      return safeSendText(sock, identity.chatJid, '✅ Bot ativado neste grupo.\nOs caminhos do Dao agora estão abertos aqui.', message)
    }
    case 'menu':
      return sock.sendMessage(identity.chatJid, { text: menuText, footer: 'Ascensão Imortal', buttons: [ { buttonId: 'menu:personagem', buttonText: { displayText: '👤 Personagem' }, type: 1 }, { buttonId: 'menu:cultivo', buttonText: { displayText: '🧘 Cultivo' }, type: 1 }, { buttonId: 'menu:mundo', buttonText: { displayText: '🌍 Mundo' }, type: 1 } ], headerType: 1 } as any, ({ quoted: message } as any))

    case 'registrar': {
      const parts = parsed.rawArgs.split('/').map((part) => part.trim()).filter(Boolean)
      if (parts.length < 2) return safeSendText(sock, identity.chatJid, '❌ Formato correto:\n!registrar Nome do Personagem / Sexo\n\nExemplo:\n!registrar Long Wei / Masculino', message)
      const [name, sex] = parts
      return startRegistration(sock, identity.chatJid, user.id, name, sex, message)
    }
    case 'perfil': case 'status': case 'atributos': return sendProfile(sock, identity.chatJid, user.id, message)
    case 'setaparencia': return parsed.rawArgs.trim() ? setAppearance(sock, identity.chatJid, user.id, parsed.rawArgs.trim(), message) : safeSendText(sock, identity.chatJid, '❌ Use: !setaparencia <link>', message)
    case 'vidas': {
      const c = await getActiveCharacter(user.id)
      return safeSendText(sock, identity.chatJid, c ? `🕯️ Vidas de ${c.name}: ${c.lives}/${c.maxLives}\nMortes acumuladas: ${c.deaths}` : '❌ Você ainda não tem personagem.', message)
    }
    case 'inventario': return showInventory(sock, identity.chatJid, user.id, message)
    case 'saldo': case 'carteira': return showWallet(sock, identity.chatJid, user.id, message)

    case 'cultivar': return cultivate(sock, identity.chatJid, user.id, parsed.rawArgs.toLowerCase(), message)
    case 'romper': return breakthrough(sock, identity.chatJid, user.id, message)
    case 'tecnicas': return showTechniques(sock, identity.chatJid, user.id, message)
    case 'aprender': return learnTechnique(sock, identity.chatJid, user.id, parsed.rawArgs, message)
    case 'dao': case 'epifania': return safeSendText(sock, identity.chatJid, '🌌 O Dao não pode ser forçado. Cultive, lute e explore para receber epifanias espontâneas.', message)

    case 'mapa': return showMap(sock, identity.chatJid, user.id, message)
    case 'local': return showLocation(sock, identity.chatJid, user.id, message)
    case 'viajar': return parsed.rawArgs ? travel(sock, identity.chatJid, user.id, parsed.rawArgs, message) : safeSendText(sock, identity.chatJid, '🧭 Use: !viajar Nome da Região', message)
    case 'explorar': case 'andar': return explore(sock, identity.chatJid, user.id, message)
    case 'cacar': case 'caçar': return explore(sock, identity.chatJid, user.id, message)
    case 'npc': return npcEncounter(sock, identity.chatJid, user.id, message)
    case 'missao': case 'missão': return showMission(sock, identity.chatJid, user.id, message)
    case 'concluir_missao': case 'concluir_missão': return completeMission(sock, identity.chatJid, user.id, message)
    case 'dungeon': case 'ruina': return safeSendText(sock, identity.chatJid, '🏯 Dungeons e ruínas aparecem como eventos raros ao usar !explorar. Regiões perigosas aumentam a chance.', message)
    case 'evento': return safeSendText(sock, identity.chatJid, '🌌 Evento atual: Maré de Qi Menor. Cultivo em regiões com Qi x2 ou maior recebe bônus narrativo e maior chance de epifania.', message)

    case 'atacar': return attack(sock, identity.chatJid, user.id, undefined, message)
    case 'usar_tecnica': return parsed.rawArgs ? attack(sock, identity.chatJid, user.id, parsed.rawArgs, message) : safeSendText(sock, identity.chatJid, '📜 Use: !usar_tecnica Nome da Técnica', message)
    case 'fugir': return flee(sock, identity.chatJid, user.id, message)
    case 'duelar': case 'arena': return safeSendText(sock, identity.chatJid, '⚔️ PvP/Arena está preparado no menu, mas esta build foca PvE global. A base de combate já está pronta para expandir duelo entre players.', message)

    case 'loja': case 'loja_diaria': return showShop(sock, identity.chatJid, message)
    case 'comprar': return parsed.rawArgs ? buyItem(sock, identity.chatJid, user.id, parsed.rawArgs, message) : safeSendText(sock, identity.chatJid, '🏮 Use: !comprar Nome do Item', message)
    case 'usar': return parsed.rawArgs ? useItem(sock, identity.chatJid, user.id, parsed.rawArgs, message) : safeSendText(sock, identity.chatJid, '🧪 Use: !usar Nome do Item', message)
    case 'vender': case 'mercado': case 'leilao': case 'lance': return safeSendText(sock, identity.chatJid, '💰 Mercado/leilão global estão reservados para a próxima camada persistente. Loja, carteira, compras e inventário já funcionam.', message)

    case 'profissao': return profession(sock, identity.chatJid, user.id, '', message)
    case 'aprender_profissao': return profession(sock, identity.chatJid, user.id, parsed.rawArgs, message)
    case 'alquimia': case 'forja': case 'formacao': case 'talismas': case 'cozinha': case 'domar': return craft(sock, identity.chatJid, user.id, parsed.command, message)
    case 'receitas': return safeSendText(sock, identity.chatJid, '📖 Receitas iniciais:\n• Pílula de Qi\n• Lâmina Espiritual Simples\n• Disco de Formação Menor\n• Talismã de Proteção\nUse o comando da profissão para criar.', message)

    case 'criarseita': return parsed.rawArgs ? createSect(sock, identity.chatJid, user.id, parsed.rawArgs, message) : safeSendText(sock, identity.chatJid, '🛕 Use: !criarseita Nome da Seita', message)
    case 'seita': return showSect(sock, identity.chatJid, user.id, message)

    case 'destino': case 'karma': case 'sorte': case 'legado': case 'samsara': return destinyInfo(sock, identity.chatJid, user.id, message)
    case 'rank': return ranks(sock, identity.chatJid, parsed.rawArgs || 'cultivo', message)

    case 'conversar': case 'trocar': case 'bloquear': case 'amigos': case 'encontros': return safeSendText(sock, identity.chatJid, '💬 Social global: o bot já identifica o mesmo jogador por número no privado e em grupos. Conversa/troca entre players fica como módulo seguro transacional da próxima versão.', message)
    case 'ajuda': case 'regras': case 'cooldowns': return safeSendText(sock, identity.chatJid, menuText, message)
    case 'testemorte': { if (!isAdmin(identity.senderPhone)) return safeSendText(sock, identity.chatJid, '⛔ Comando de teste apenas para admin.', message); return damageLifeAndMaybeCreateLegacy(sock, identity.chatJid, user.id) }
    case 'reencarnar': {
      const legacy = await prisma.legacy.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
      if (!legacy) return safeSendText(sock, identity.chatJid, '🌊 Você ainda não possui legado no Samsara.', message)
      return safeSendText(sock, identity.chatJid, `🌌 *LOJA DO SAMSARA*\n\nVocê possui: *${legacy.fatePoints - legacy.spentPoints} Pontos de Destino*\n\n1️⃣ Herdar Linhagem Menor — 500 PD\n2️⃣ Herdar 10% da riqueza — 700 PD\n3️⃣ Herdar uma técnica comum — 800 PD\n4️⃣ Herdar histórico nobre — 1.000 PD\n5️⃣ Herdar talento parcial — 1.500 PD\n6️⃣ Herdar corpo especial fraco — 2.500 PD\n\nA compra automática será o próximo refinamento do Samsara.`, message)
    }
    default: return safeSendText(sock, identity.chatJid, `❔ Comando não reconhecido: !${parsed.command}\nUse !menu para ver os comandos.`, message)
  }
}
