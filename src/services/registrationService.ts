import type { proto, WASocket } from '@whiskeysockets/baileys'
import { prisma } from '../database/prisma.js'
import {
  calculateVitals,
  generateInitialRoll,
  InitialRoll,
  karmaTitle,
  moralityAnswerToKarma,
  moralityQuestions,
  rarityIcons
} from '../game/definitions.js'
import { sendReactionPrompt } from './promptService.js'
import { makeBar } from '../utils/bars.js'

function rarityLabel(rarity: string): string {
  return `${rarityIcons[rarity] ?? '▫️'} ${rarity}`
}

function formatRoll(name: string, roll: InitialRoll, rerollsUsed: number): string {
  const forced = rerollsUsed >= 3
  return `🌌 *O Céu revelou seu nascimento...*\n\n` +
    `👤 *Nome:* ${name}\n` +
    `🧬 *Raça:* ${roll.race.name} — ${rarityLabel(roll.race.rarity)}\n` +
    `🏛️ *Clã de Origem:* ${roll.clan.name} — ${rarityLabel(roll.clan.rarity)}\n` +
    `🌟 *Talento:* ${roll.talent.name} Nv.${roll.talent.level} — ${rarityLabel(roll.talent.rarity)}\n` +
    `🌌 *Destino:* ${roll.destiny.name} Nv.${roll.destiny.level} — ${rarityLabel(roll.destiny.rarity)}\n` +
    `🍀 *Sorte:* ${roll.luck.name} Nv.${roll.luck.level} — ${rarityLabel(roll.luck.rarity)}\n` +
    `🌱 *Raiz:* ${roll.spiritualRoot.name} — ${rarityLabel(roll.spiritualRoot.rarity)}\n` +
    `✨ *Corpo Divino:* ${roll.divineBody.name} — ${rarityLabel(roll.divineBody.rarity)}\n` +
    `📍 *Região:* ${roll.region.name}\n\n` +
    (forced
      ? `⚖️ O Céu não tolera hesitação eterna.\n*Este será seu destino final.*`
      : `Você aceita este destino?\n\n1️⃣ Aceitar\n2️⃣ Rejeitar e sortear novamente\n\nRerolls restantes: ${3 - rerollsUsed}`)
}

function formatNarrative(name: string, sex: string, roll: InitialRoll): string {
  return `🌙 *NASCIMENTO SOB OS CÉUS*\n\n` +
    `${name} nasceu em ${roll.region.name}, onde ${roll.region.description.toLowerCase()}\n\n` +
    `Pertencente ao ${roll.clan.name}, ${sex.toLowerCase().startsWith('f') ? 'ela' : 'ele'} cresceu sob tradições antigas: ${roll.clan.description.toLowerCase()}\n\n` +
    `Seu sangue carrega a natureza de ${roll.race.name}, uma origem descrita assim pelos anciãos: ${roll.race.description}\n\n` +
    `Na noite de seu nascimento, o Qi ao redor tremeu levemente. Alguns viram nisso uma bênção. Outros, um presságio.\n\n` +
    `🌌 *Destino registrado:* ${roll.destiny.name}\n` +
    `🌟 *Talento revelado:* ${roll.talent.name}\n\n` +
    `A partir deste dia, seu caminho no Dao começa.`
}

function formatMoralityQuestion(index: number): string {
  const item = moralityQuestions[index]
  const answers = item.answers.map((answer, i) => `${i + 1}️⃣ ${answer}`).join('\n')
  return `🎭 *Teste de Índole*\n\n` +
    `Pergunta ${index + 1}/${moralityQuestions.length}\n\n` +
    `❓ ${item.question}\n\n${answers}\n\n` +
    `Reaja a esta imagem com 1️⃣, 2️⃣, 3️⃣, 4️⃣ ou 5️⃣.\n` +
    `Também aceito você responder digitando apenas o número.`
}

export async function startRegistration(
  sock: WASocket,
  chatJid: string,
  userId: string,
  name: string,
  sex: string,
  quoted?: proto.IWebMessageInfo
) {
  const active = await prisma.character.findFirst({ where: { userId, active: true, isFinalDead: false } })
  if (active) {
    await sock.sendMessage(chatJid, { text: `❌ Você já possui um personagem ativo: *${active.name}*.\nUse !perfil para ver seus dados.` }, quoted ? ({ quoted } as any) : undefined)
    return
  }

  const roll = generateInitialRoll()
  const flow = await prisma.registrationFlow.create({
    data: {
      userId,
      chatJid,
      name,
      sex,
      currentRoll: roll as any,
      rerollsUsed: 0,
      step: 'ROLL_CONFIRM'
    }
  })

  await sendReactionPrompt(sock, chatJid, userId, 'REGISTER_ROLL_CONFIRM', formatRoll(name, roll, 0), {
    options: [1, 2],
    flowId: flow.id
  }, quoted)
}

export async function handleRollChoice(sock: WASocket, chatJid: string, flowId: string, choice: number) {
  const flow = await prisma.registrationFlow.findUnique({ where: { id: flowId } })
  if (!flow || flow.isFinished) return

  if (choice === 2 && flow.rerollsUsed < 3) {
    const rerollsUsed = flow.rerollsUsed + 1
    const roll = generateInitialRoll()
    await prisma.registrationFlow.update({
      where: { id: flow.id },
      data: { rerollsUsed, currentRoll: roll as any }
    })

    if (rerollsUsed >= 3) {
      await acceptRollAndStartMorality(sock, chatJid, flow.id, roll)
      return
    }

    await sendReactionPrompt(sock, chatJid, flow.userId, 'REGISTER_ROLL_CONFIRM', formatRoll(flow.name, roll, rerollsUsed), {
      options: [1, 2],
      flowId: flow.id
    })
    return
  }

  await acceptRollAndStartMorality(sock, chatJid, flow.id, flow.currentRoll as unknown as InitialRoll)
}

async function acceptRollAndStartMorality(sock: WASocket, chatJid: string, flowId: string, roll: InitialRoll) {
  const flow = await prisma.registrationFlow.update({
    where: { id: flowId },
    data: { step: 'MORALITY', currentRoll: roll as any }
  })

  await sock.sendMessage(chatJid, { text: formatNarrative(flow.name, flow.sex, roll) })
  await sendReactionPrompt(sock, chatJid, flow.userId, 'MORALITY_QUESTION', formatMoralityQuestion(0), {
    options: [1, 2, 3, 4, 5],
    flowId: flow.id,
    questionIndex: 0
  })
}

export async function handleMoralityChoice(sock: WASocket, chatJid: string, flowId: string, answer: number) {
  const flow = await prisma.registrationFlow.findUnique({ where: { id: flowId } })
  if (!flow || flow.isFinished) return

  const previous = Array.isArray(flow.moralityAnswers) ? flow.moralityAnswers as number[] : []
  const answers = [...previous, answer]

  if (answers.length < moralityQuestions.length) {
    await prisma.registrationFlow.update({
      where: { id: flow.id },
      data: { moralityAnswers: answers as any }
    })

    await sendReactionPrompt(sock, chatJid, flow.userId, 'MORALITY_QUESTION', formatMoralityQuestion(answers.length), {
      options: [1, 2, 3, 4, 5],
      flowId: flow.id,
      questionIndex: answers.length
    })
    return
  }

  const karmaValue = answers.reduce((sum, item) => sum + moralityAnswerToKarma(item), 0)
  const title = karmaTitle(karmaValue)
  const roll = flow.currentRoll as unknown as InitialRoll
  const vitals = calculateVitals(roll.attributes)

  const character = await prisma.character.create({
    data: {
      userId: flow.userId,
      name: flow.name,
      sex: flow.sex,
      raceName: roll.race.name,
      clanName: roll.clan.name,
      talentName: roll.talent.name,
      talentLevel: roll.talent.level,
      destinyName: roll.destiny.name,
      destinyLevel: roll.destiny.level,
      luckName: roll.luck.name,
      luckLevel: roll.luck.level,
      karmaValue,
      karmaTitle: title,
      spiritualRootName: roll.spiritualRoot.name,
      divineBodyName: roll.divineBody.name,
      regionName: roll.region.name,
      hp: vitals.maxHp,
      maxHp: vitals.maxHp,
      qi: vitals.maxQi,
      maxQi: vitals.maxQi,
      soulPower: vitals.maxSoulPower,
      maxSoulPower: vitals.maxSoulPower,
      strength: roll.attributes.strength,
      constitution: roll.attributes.constitution,
      agility: roll.attributes.agility,
      intelligence: roll.attributes.intelligence,
      perception: roll.attributes.perception,
      spirit: roll.attributes.spirit,
      willpower: roll.attributes.willpower,
      charisma: roll.attributes.charisma,
      luckAttribute: roll.attributes.luckAttribute
    }
  })

  await prisma.registrationFlow.update({
    where: { id: flow.id },
    data: { moralityAnswers: answers as any, isFinished: true, step: 'FINISHED' }
  })

  await sock.sendMessage(chatJid, {
    text: `⚖️ *Julgamento da Índole*\n\n` +
      `Suas respostas revelaram seu coração.\n\n` +
      `Karma Inicial: *${karmaValue >= 0 ? '+' : ''}${karmaValue}*\n` +
      `Índole: *${title}*\n\n` +
      `🌌 *Personagem criado!*\n\n` +
      `👤 ${character.name}\n` +
      `🧬 ${character.raceName}\n` +
      `🏛️ ${character.clanName}\n` +
      `🌟 ${character.talentName}\n` +
      `🌌 ${character.destinyName}\n` +
      `🍀 ${character.luckName}\n` +
      `🕯️ Vidas: ${character.lives}/${character.maxLives}\n` +
      `❤️ HP ${makeBar(character.hp, character.maxHp)}\n` +
      `🔷 Qi ${makeBar(character.qi, character.maxQi)}\n\n` +
      `🖼️ Agora defina a aparência do personagem com:\n` +
      `!setaparencia <link>\n\n` +
      `Use !perfil ou !menu para continuar.`
  })
}
