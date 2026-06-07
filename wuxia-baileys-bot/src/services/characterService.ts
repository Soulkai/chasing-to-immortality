import type { proto, WASocket } from '@whiskeysockets/baileys'
import { prisma } from '../database/prisma.js'
import { makeBar } from '../utils/bars.js'

export async function getActiveCharacter(userId: string) {
  return prisma.character.findFirst({
    where: { userId, active: true, isFinalDead: false },
    orderBy: { createdAt: 'desc' }
  })
}

export async function setAppearance(sock: WASocket, chatJid: string, userId: string, url: string, quoted?: proto.IWebMessageInfo) {
  const character = await getActiveCharacter(userId)
  if (!character) {
    await sock.sendMessage(chatJid, { text: '❌ Você precisa criar um personagem primeiro. Use !registrar Nome / Sexo.' }, quoted ? { quoted } : undefined)
    return
  }

  if (!/^https?:\/\//i.test(url)) {
    await sock.sendMessage(chatJid, { text: '❌ Link inválido. Use um link começando com http:// ou https://.' }, quoted ? { quoted } : undefined)
    return
  }

  await prisma.character.update({ where: { id: character.id }, data: { appearanceUrl: url } })
  await sock.sendMessage(chatJid, { text: '✅ Aparência definida com sucesso!\nEla será exibida sempre que você usar !perfil.' }, quoted ? { quoted } : undefined)
}

export function formatProfile(character: Awaited<ReturnType<typeof getActiveCharacter>>): string {
  if (!character) return '❌ Personagem não encontrado.'

  return `👤 *Perfil de ${character.name}*\n\n` +
    `🧬 *Raça:* ${character.raceName}\n` +
    `🏛️ *Clã de Origem:* ${character.clanName}\n` +
    `🌟 *Talento:* ${character.talentName} Nv.${character.talentLevel}\n` +
    `🌌 *Destino:* ${character.destinyName} Nv.${character.destinyLevel}\n` +
    `🍀 *Sorte:* ${character.luckName} Nv.${character.luckLevel}\n` +
    `⚖️ *Karma:* ${character.karmaTitle} (${character.karmaValue >= 0 ? '+' : ''}${character.karmaValue})\n\n` +
    `🌱 *Raiz:* ${character.spiritualRootName}\n` +
    `✨ *Corpo Divino:* ${character.divineBodyName}\n` +
    `📍 *Região:* ${character.regionName}\n` +
    `🛕 *Seita:* ${character.sectName}\n\n` +
    `💢 *Corpo:* ${character.bodyRealm} ${character.bodyStage}\n` +
    `🌀 *Espírito:* ${character.spiritRealm} ${character.spiritStage}\n` +
    `👁️ *Alma:* ${character.soulRealm} ${character.soulStage}\n\n` +
    `❤️ *HP* ${makeBar(character.hp, character.maxHp)}\n` +
    `🔷 *Qi* ${makeBar(character.qi, character.maxQi)}\n` +
    `👁️ *Alma* ${makeBar(character.soulPower, character.maxSoulPower)}\n` +
    `🕯️ *Vidas:* ${character.lives}/${character.maxLives}\n\n` +
    `⚔️ *Força:* ${character.strength}\n` +
    `🛡️ *Constituição:* ${character.constitution}\n` +
    `💨 *Agilidade:* ${character.agility}\n` +
    `🧠 *Inteligência:* ${character.intelligence}\n` +
    `👁️ *Percepção:* ${character.perception}\n` +
    `🌀 *Espírito:* ${character.spirit}\n` +
    `🔥 *Vontade:* ${character.willpower}\n` +
    `🗣️ *Carisma:* ${character.charisma}\n` +
    `🍀 *Sorte:* ${character.luckAttribute}\n\n` +
    `Use os botões se aparecerem ou digite:\n` +
    `1 - Atributos\n2 - Inventário\n3 - Carteira\n4 - Técnicas\n5 - Seita\n6 - Explorar`
}

export async function sendProfile(sock: WASocket, chatJid: string, userId: string, quoted?: proto.IWebMessageInfo) {
  const character = await getActiveCharacter(userId)
  if (!character) {
    await sock.sendMessage(chatJid, { text: '❌ Você ainda não tem personagem.\nUse: !registrar Nome / Sexo' }, quoted ? { quoted } : undefined)
    return
  }

  const text = formatProfile(character)
  const buttons = [
    { buttonId: 'profile:attributes', buttonText: { displayText: '📊 Atributos' }, type: 1 },
    { buttonId: 'profile:inventory', buttonText: { displayText: '🎒 Inventário' }, type: 1 },
    { buttonId: 'profile:wallet', buttonText: { displayText: '💰 Carteira' }, type: 1 }
  ]

  if (character.appearanceUrl) {
    try {
      await sock.sendMessage(chatJid, {
        image: { url: character.appearanceUrl },
        caption: text,
        footer: 'Caminho do Dao',
        buttons,
        headerType: 4
      } as any, quoted ? { quoted } : undefined)
      return
    } catch {
      await sock.sendMessage(chatJid, { text: `${text}\n\n⚠️ Não consegui carregar a aparência salva. Use !setaparencia <link> para trocar.` }, quoted ? { quoted } : undefined)
      return
    }
  }

  await sock.sendMessage(chatJid, {
    text,
    footer: 'Caminho do Dao',
    buttons,
    headerType: 1
  } as any, quoted ? { quoted } : undefined)
}

export async function damageLifeAndMaybeCreateLegacy(sock: WASocket, chatJid: string, userId: string) {
  const character = await getActiveCharacter(userId)
  if (!character) return

  const lives = Math.max(0, character.lives - 1)
  const deaths = character.deaths + 1

  if (lives > 0) {
    await prisma.character.update({ where: { id: character.id }, data: { lives, deaths, hp: Math.max(1, Math.floor(character.maxHp * 0.25)) } })
    await sock.sendMessage(chatJid, { text: `☠️ *Você morreu.*\n\nVidas restantes: ${lives}/${character.maxLives}\nSeu corpo foi destruído, mas sua alma escapou por pouco.` })
    return
  }

  const fatePoints =
    character.spiritRealmIndex * 100 +
    character.bodyRealmIndex * 80 +
    character.soulRealmIndex * 90 +
    character.bossesKilled * 50 +
    character.techniquesMastered * 30 +
    Math.floor(character.wealthEarned / 1000) +
    Math.abs(character.karmaValue) * 2 +
    (character.foundedSect ? 500 : 0)

  const summary = {
    name: character.name,
    spiritRealm: `${character.spiritRealm} ${character.spiritStage}`,
    bodyRealm: `${character.bodyRealm} ${character.bodyStage}`,
    soulRealm: `${character.soulRealm} ${character.soulStage}`,
    karma: character.karmaValue,
    bossesKilled: character.bossesKilled,
    techniquesMastered: character.techniquesMastered,
    foundedSect: character.foundedSect,
    wealthEarned: character.wealthEarned
  }

  await prisma.$transaction([
    prisma.character.update({ where: { id: character.id }, data: { lives: 0, deaths, active: false, isFinalDead: true, hp: 0 } }),
    prisma.legacy.create({ data: { userId, oldCharacterId: character.id, fatePoints, summary } })
  ])

  await sock.sendMessage(chatJid, {
    text: `🕯️ *FIM DA VIDA*\n\n` +
      `${character.name} caiu pela nona vez.\n` +
      `Seu corpo retornou ao pó, mas seus feitos ecoam no tecido do Destino.\n\n` +
      `🌌 *Pontos de Destino gerados:* ${fatePoints}\n\n` +
      `Use !reencarnar para iniciar uma nova vida.`
  })
}
