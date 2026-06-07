import type { proto, WASocket } from '@whiskeysockets/baileys'
import { prisma } from '../database/prisma.js'
import { makeBar } from '../utils/bars.js'
import { getActiveCharacter } from './characterService.js'
import { botShop, bodyRealms, regions, soulRealms, spiritRealms, techniques } from '../game/world.js'
import { calculateVitals, karmaTitle } from '../game/definitions.js'

function pick<T>(items: T[]): T { return items[Math.floor(Math.random() * items.length)] }
function roll(min: number, max: number): number { return min + Math.floor(Math.random() * (max - min + 1)) }
function asInv(value: unknown): Record<string, number> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, number> : {} }
function asList(value: unknown): string[] { return Array.isArray(value) ? value.filter((x) => typeof x === 'string') : [] }
function asObj<T = any>(value: unknown): T | null { return value && typeof value === 'object' ? value as T : null }
function regionOf(name: string) { return regions.find((r) => r.name === name) ?? regions[0] }
function realmPower(c: any) { return c.spiritRealmIndex * 12 + c.spiritStage * 2 + c.bodyRealmIndex * 10 + c.bodyStage * 2 + c.soulRealmIndex * 9 + c.soulStage * 2 }
function updateVitalsData(c: any) {
  const vitals = calculateVitals({ strength: c.strength, constitution: c.constitution, agility: c.agility, intelligence: c.intelligence, perception: c.perception, spirit: c.spirit, willpower: c.willpower, charisma: c.charisma, luckAttribute: c.luckAttribute }, c.bodyRealmIndex, c.spiritRealmIndex, c.soulRealmIndex)
  return { maxHp: vitals.maxHp, maxQi: vitals.maxQi, maxSoulPower: vitals.maxSoulPower }
}
async function needChar(sock: WASocket, chatJid: string, userId: string, quoted?: proto.IWebMessageInfo) {
  const c = await getActiveCharacter(userId)
  if (!c) await sock.sendMessage(chatJid, { text: '❌ Você ainda não tem personagem. Use: !registrar Nome / Sexo' }, quoted ? ({ quoted } as any) : undefined)
  return c as any
}

export async function showInventory(sock: WASocket, chatJid: string, userId: string, quoted?: proto.IWebMessageInfo) {
  const c = await needChar(sock, chatJid, userId, quoted); if (!c) return
  const inv = asInv(c.inventory)
  const lines = Object.entries(inv).filter(([, q]) => q > 0).map(([n, q]) => `• ${n} x${q}`)
  await sock.sendMessage(chatJid, { text: `🎒 *Inventário de ${c.name}*\n\n${lines.length ? lines.join('\n') : 'Vazio. Explore, compre ou complete missões para conseguir itens.'}` }, quoted ? ({ quoted } as any) : undefined)
}

export async function showWallet(sock: WASocket, chatJid: string, userId: string, quoted?: proto.IWebMessageInfo) {
  const c = await needChar(sock, chatJid, userId, quoted); if (!c) return
  await sock.sendMessage(chatJid, { text: `💰 *Carteira*\n\n👤 ${c.name}\n💎 Pedras Espirituais: *${c.spiritStones}*\n⭐ Reputação: *${c.reputation}*\n⚖️ Karma: *${c.karmaTitle}* (${c.karmaValue >= 0 ? '+' : ''}${c.karmaValue})` }, quoted ? ({ quoted } as any) : undefined)
}

export async function showMap(sock: WASocket, chatJid: string, userId: string, quoted?: proto.IWebMessageInfo) {
  const c = await needChar(sock, chatJid, userId, quoted); if (!c) return
  const current = regionOf(c.regionName)
  const lines = regions.map((r) => `${r.name === current.name ? '📍' : '▫️'} ${r.name} — perigo ${r.danger}, Qi x${r.qiDensity}`).join('\n')
  await sock.sendMessage(chatJid, { text: `🗺️ *Mapa dos Reinos Mortais*\n\n${lines}\n\nDe sua região atual você pode viajar para:\n${current.travel.map((x) => `• ${x}`).join('\n')}\n\nUse: !viajar Nome da Região` }, quoted ? ({ quoted } as any) : undefined)
}

export async function showLocation(sock: WASocket, chatJid: string, userId: string, quoted?: proto.IWebMessageInfo) {
  const c = await needChar(sock, chatJid, userId, quoted); if (!c) return
  const r = regionOf(c.regionName)
  await sock.sendMessage(chatJid, { text: `📍 *${r.name}*\n\n${r.description}\n\n☯️ Densidade de Qi: x${r.qiDensity}\n☠️ Perigo: ${r.danger}/7\n\n🧙 NPCs vistos:\n${r.npcs.map((x) => `• ${x}`).join('\n')}\n\n🌿 Recursos:\n${r.resources.map((x) => `• ${x}`).join('\n')}\n\n🐾 Ameaças:\n${r.beasts.map((x) => `• ${x}`).join('\n')}` }, quoted ? ({ quoted } as any) : undefined)
}

export async function travel(sock: WASocket, chatJid: string, userId: string, destination: string, quoted?: proto.IWebMessageInfo) {
  const c = await needChar(sock, chatJid, userId, quoted); if (!c) return
  const current = regionOf(c.regionName)
  const dest = regions.find((r) => r.name.toLowerCase() === destination.toLowerCase())
  if (!dest) return sock.sendMessage(chatJid, { text: '❌ Região não encontrada. Use !mapa.' }, quoted ? ({ quoted } as any) : undefined)
  if (!current.travel.includes(dest.name)) return sock.sendMessage(chatJid, { text: `❌ Você não pode viajar diretamente de ${current.name} para ${dest.name}. Use !mapa para ver rotas.` }, quoted ? ({ quoted } as any) : undefined)
  if (c.spiritRealmIndex < dest.minSpiritRealm) return sock.sendMessage(chatJid, { text: `⛔ Seu cultivo é baixo para sobreviver em ${dest.name}. Requisito: ${spiritRealms[dest.minSpiritRealm]}.` }, quoted ? ({ quoted } as any) : undefined)
  const cost = 20 + dest.danger * 15
  if (c.spiritStones < cost) return sock.sendMessage(chatJid, { text: `💎 Você precisa de ${cost} pedras espirituais para viajar.` }, quoted ? ({ quoted } as any) : undefined)
  await prisma.character.update({ where: { id: c.id }, data: { regionName: dest.name, spiritStones: { decrement: cost }, currentActivity: 'VIAJANDO' } })
  await sock.sendMessage(chatJid, { text: `🧭 *Viagem concluída*\n\nVocê atravessou caminhos de poeira, rios de Qi e portões de cultivadores.\n\n📍 Nova região: *${dest.name}*\n💎 Custo: ${cost}\n\n${dest.description}` }, quoted ? ({ quoted } as any) : undefined)
}

export async function cultivate(sock: WASocket, chatJid: string, userId: string, mode: string, quoted?: proto.IWebMessageInfo) {
  const c = await needChar(sock, chatJid, userId, quoted); if (!c) return
  const r = regionOf(c.regionName)
  const talentBonus = 1 + Math.max(-0.4, c.talentLevel * 0.08)
  const gain = Math.floor((35 + c.spirit * 3 + r.qiDensity * 18 + roll(0, 25)) * talentBonus)
  const updates: any = { qi: Math.min(c.maxQi, c.qi + 8 + r.qiDensity * 3), currentActivity: 'CULTIVANDO' }
  let label = 'espiritual'
  if (mode.includes('fis')) { updates.bodyExp = { increment: gain }; label = 'físico' }
  else if (mode.includes('alma')) { updates.soulExp = { increment: gain }; label = 'da alma' }
  else if (mode.includes('todos')) { updates.spiritExp = { increment: Math.floor(gain * .7) }; updates.bodyExp = { increment: Math.floor(gain * .55) }; updates.soulExp = { increment: Math.floor(gain * .55) }; label = 'triplo' }
  else updates.spiritExp = { increment: gain }
  const epiphanyChance = Math.min(35, 2 + c.spirit * 0.45 + c.luckAttribute * 0.35 + c.talentLevel * 1.3)
  let extra = ''
  if (Math.random() * 100 < epiphanyChance) {
    updates.spiritExp = { increment: (updates.spiritExp?.increment ?? 0) + 120 }
    updates.soulExp = { increment: (updates.soulExp?.increment ?? 0) + 60 }
    updates.intelligence = { increment: 1 }
    extra = '\n\n🌌 *Epifania!* Você compreendeu um pequeno padrão do Dao. +120 cultivo espiritual, +60 alma, +1 inteligência.'
  }
  await prisma.character.update({ where: { id: c.id }, data: updates })
  await sock.sendMessage(chatJid, { text: `🧘 *Cultivo ${label}*\n\nVocê sentou em silêncio em ${r.name}. O Qi circulou por seus meridianos.\n\nGanho base: *${gain}*${extra}\n\nUse !romper quando sentir que o gargalo chegou.` }, quoted ? ({ quoted } as any) : undefined)
}

export async function breakthrough(sock: WASocket, chatJid: string, userId: string, quoted?: proto.IWebMessageInfo) {
  const c = await needChar(sock, chatJid, userId, quoted); if (!c) return
  const need = 220 + c.spiritRealmIndex * 180 + c.spiritStage * 90
  if (c.spiritExp < need) return sock.sendMessage(chatJid, { text: `🌀 Gargalo ainda distante.\nCultivo espiritual: ${c.spiritExp}/${need}` }, quoted ? ({ quoted } as any) : undefined)
  const chance = Math.min(92, 42 + c.talentLevel * 5 + c.willpower * 1.3 + c.spirit * 0.9 + c.luckAttribute * .8 - c.spiritRealmIndex * 4)
  if (Math.random() * 100 > chance) {
    await prisma.character.update({ where: { id: c.id }, data: { spiritExp: Math.floor(c.spiritExp * .55), hp: Math.max(1, Math.floor(c.hp * .65)), karmaValue: c.karmaValue - 1, karmaTitle: karmaTitle(c.karmaValue - 1) } })
    return sock.sendMessage(chatJid, { text: `💥 *Rompimento falhou*\n\nSeu Qi entrou em turbulência. Você perdeu parte do acúmulo e sofreu ferimentos internos.\nChance usada: ${chance.toFixed(1)}%` }, quoted ? ({ quoted } as any) : undefined)
  }
  let stage = c.spiritStage + 1
  let realmIndex = c.spiritRealmIndex
  if (stage > 9) { stage = 1; realmIndex += 1 }
  const spiritRealm = spiritRealms[realmIndex] ?? 'Além do Dao'
  const attrs = { ...c, spiritRealmIndex: realmIndex }
  const vitals = updateVitalsData(attrs)
  await prisma.character.update({ where: { id: c.id }, data: { spiritStage: stage, spiritRealmIndex: realmIndex, spiritRealm, spiritExp: 0, spirit: { increment: 1 }, intelligence: { increment: 1 }, maxQi: vitals.maxQi, qi: vitals.maxQi } })
  await sock.sendMessage(chatJid, { text: `⚡ *Rompimento bem-sucedido!*\n\nO Qi explodiu como trovão em seus meridianos.\n\n🌀 Novo reino: *${spiritRealm} ${stage}*\n+1 Espírito\n+1 Inteligência\n🔷 Qi restaurado: ${vitals.maxQi}/${vitals.maxQi}` }, quoted ? ({ quoted } as any) : undefined)
}

export async function showTechniques(sock: WASocket, chatJid: string, userId: string, quoted?: proto.IWebMessageInfo) {
  const c = await needChar(sock, chatJid, userId, quoted); if (!c) return
  const known = asList(c.knownTechniques)
  const lines = ['Punho Mortal', ...known].filter((v, i, a) => a.indexOf(v) === i).map((n) => {
    const t = techniques.find((x) => x.name === n) ?? techniques[0]
    return `• ${t.name} [${t.rarity}] — custo ${t.qiCost} Qi — ${t.description}`
  })
  await sock.sendMessage(chatJid, { text: `📜 *Técnicas conhecidas*\n\n${lines.join('\n')}\n\nUse: !aprender Nome da Técnica\nUse em combate: !usar_tecnica Nome` }, quoted ? ({ quoted } as any) : undefined)
}

export async function learnTechnique(sock: WASocket, chatJid: string, userId: string, name: string, quoted?: proto.IWebMessageInfo) {
  const c = await needChar(sock, chatJid, userId, quoted); if (!c) return
  const t = techniques.find((x) => x.name.toLowerCase() === name.toLowerCase())
  if (!t) return sock.sendMessage(chatJid, { text: `❌ Técnica não encontrada. Técnicas disponíveis:\n${techniques.map((x) => `• ${x.name}`).join('\n')}` }, quoted ? ({ quoted } as any) : undefined)
  const known = asList(c.knownTechniques)
  if (known.includes(t.name)) return sock.sendMessage(chatJid, { text: `📜 Você já conhece ${t.name}.` }, quoted ? ({ quoted } as any) : undefined)
  const cost = t.rarity === 'Comum' ? 180 : t.rarity === 'Incomum' ? 450 : t.rarity === 'Raro' ? 900 : t.rarity === 'Épico' ? 1800 : 4200
  if (c.spiritStones < cost) return sock.sendMessage(chatJid, { text: `💎 Aprender ${t.name} custa ${cost} pedras espirituais.` }, quoted ? ({ quoted } as any) : undefined)
  known.push(t.name)
  await prisma.character.update({ where: { id: c.id }, data: { knownTechniques: known as any, spiritStones: { decrement: cost }, techniquesMastered: { increment: 1 } } })
  await sock.sendMessage(chatJid, { text: `📜 *Técnica aprendida!*\n\n${t.name}\n${t.description}\n\n💎 Custo: ${cost}` }, quoted ? ({ quoted } as any) : undefined)
}

export async function explore(sock: WASocket, chatJid: string, userId: string, quoted?: proto.IWebMessageInfo) {
  const c = await needChar(sock, chatJid, userId, quoted); if (!c) return
  const r = regionOf(c.regionName)
  const event = Math.random()
  if (event < 0.30) return startCombat(sock, chatJid, userId, pick(r.beasts), quoted)
  if (event < 0.52) {
    const item = pick(r.resources); const qty = roll(1, 2 + Math.floor(c.luckAttribute / 4)); const inv = asInv(c.inventory); inv[item] = (inv[item] ?? 0) + qty
    await prisma.character.update({ where: { id: c.id }, data: { inventory: inv as any, reputation: { increment: 1 }, currentActivity: 'EXPLORANDO' } })
    return sock.sendMessage(chatJid, { text: `🌿 *Descoberta*\n\nExplorando ${r.name}, você encontrou *${item} x${qty}*.\n\nSua reputação local aumentou levemente.` }, quoted ? ({ quoted } as any) : undefined)
  }
  if (event < 0.76) return npcEncounter(sock, chatJid, userId, quoted)
  if (event < 0.92) {
    const stones = roll(35, 90 + r.danger * 40)
    await prisma.character.update({ where: { id: c.id }, data: { spiritStones: { increment: stones }, wealthEarned: { increment: stones } } })
    return sock.sendMessage(chatJid, { text: `💎 *Veio espiritual*\n\nVocê encontrou pequenas pedras espirituais enterradas sob raízes antigas.\n\n+${stones} Pedras Espirituais` }, quoted ? ({ quoted } as any) : undefined)
  }
  await prisma.character.update({ where: { id: c.id }, data: { spiritExp: { increment: 160 }, soulExp: { increment: 70 }, currentActivity: 'EXPLORANDO' } })
  return sock.sendMessage(chatJid, { text: `🏯 *Ruína Oculta*\n\nUma parede coberta por musgo revelou inscrições antigas. Você não obteve tesouro material, mas compreendeu traços de uma técnica esquecida.\n\n+160 cultivo espiritual\n+70 cultivo da alma` }, quoted ? ({ quoted } as any) : undefined)
}

export async function npcEncounter(sock: WASocket, chatJid: string, userId: string, quoted?: proto.IWebMessageInfo) {
  const c = await needChar(sock, chatJid, userId, quoted); if (!c) return
  const r = regionOf(c.regionName); const npc = pick(r.npcs)
  const good = c.karmaValue >= 50 || c.reputation >= 10
  const dark = c.karmaValue <= -50
  const mission = {
    npc, region: r.name, kind: good ? 'proteção' : dark ? 'intimidação' : 'coleta',
    target: good ? `proteger viajantes contra ${pick(r.beasts)}` : dark ? `cobrar dívida de um cultivador fraco` : `coletar ${pick(r.resources)} x2`,
    rewardStones: roll(120, 260 + r.danger * 60), rewardKarma: good ? 4 : dark ? -4 : 1, rewardRep: good ? 4 : dark ? -2 : 2
  }
  await prisma.character.update({ where: { id: c.id }, data: { activeMission: mission as any } })
  const tone = good ? 'reconheceu sua reputação honrada e pediu ajuda sem medo' : dark ? 'baixou a voz, percebendo sua aura perigosa, e ofereceu uma tarefa suja' : 'avaliou você com cautela e ofereceu uma pequena missão'
  await sock.sendMessage(chatJid, { text: `🧙 *Encontro com NPC*\n\n${npc} ${tone}.\n\n📜 Missão: ${mission.target}\n💎 Recompensa: ${mission.rewardStones}\n⚖️ Karma: ${mission.rewardKarma >= 0 ? '+' : ''}${mission.rewardKarma}\n⭐ Reputação: ${mission.rewardRep >= 0 ? '+' : ''}${mission.rewardRep}\n\nUse !missao para ver.\nUse !concluir_missao para tentar concluir.` }, quoted ? ({ quoted } as any) : undefined)
}

export async function showMission(sock: WASocket, chatJid: string, userId: string, quoted?: proto.IWebMessageInfo) {
  const c = await needChar(sock, chatJid, userId, quoted); if (!c) return
  const m = asObj(c.activeMission)
  if (!m) return sock.sendMessage(chatJid, { text: '📜 Você não possui missão ativa. Use !explorar para encontrar NPCs.' }, quoted ? ({ quoted } as any) : undefined)
  await sock.sendMessage(chatJid, { text: `📜 *Missão Ativa*\n\nNPC: ${m.npc}\nRegião: ${m.region}\nObjetivo: ${m.target}\nTipo: ${m.kind}\n\nRecompensa: ${m.rewardStones} pedras\nKarma: ${m.rewardKarma >= 0 ? '+' : ''}${m.rewardKarma}\nReputação: ${m.rewardRep >= 0 ? '+' : ''}${m.rewardRep}\n\nUse !concluir_missao` }, quoted ? ({ quoted } as any) : undefined)
}

export async function completeMission(sock: WASocket, chatJid: string, userId: string, quoted?: proto.IWebMessageInfo) {
  const c = await needChar(sock, chatJid, userId, quoted); if (!c) return
  const m = asObj<any>(c.activeMission)
  if (!m) return sock.sendMessage(chatJid, { text: '📜 Você não possui missão ativa.' }, quoted ? ({ quoted } as any) : undefined)
  const success = Math.random() * 100 < Math.min(90, 45 + c.perception * 2 + c.charisma + c.spiritRealmIndex * 5)
  if (!success) {
    await prisma.character.update({ where: { id: c.id }, data: { hp: Math.max(1, c.hp - roll(8, 24)), activeMission: null } })
    return sock.sendMessage(chatJid, { text: `❌ *Missão falhou*\n\nVocê não conseguiu completar: ${m.target}.\nSofreu ferimentos e perdeu a oportunidade.` }, quoted ? ({ quoted } as any) : undefined)
  }
  const karma = c.karmaValue + m.rewardKarma
  await prisma.character.update({ where: { id: c.id }, data: { activeMission: null, spiritStones: { increment: m.rewardStones }, wealthEarned: { increment: m.rewardStones }, reputation: { increment: m.rewardRep }, karmaValue: karma, karmaTitle: karmaTitle(karma), spiritExp: { increment: 90 } } })
  await sock.sendMessage(chatJid, { text: `✅ *Missão concluída*\n\n${m.npc} recebeu a notícia e recompensou você.\n\n💎 +${m.rewardStones}\n⚖️ Karma ${m.rewardKarma >= 0 ? '+' : ''}${m.rewardKarma}\n⭐ Reputação ${m.rewardRep >= 0 ? '+' : ''}${m.rewardRep}\n🌀 +90 cultivo espiritual` }, quoted ? ({ quoted } as any) : undefined)
}

export async function startCombat(sock: WASocket, chatJid: string, userId: string, beastName: string, quoted?: proto.IWebMessageInfo) {
  const c = await needChar(sock, chatJid, userId, quoted); if (!c) return
  if (c.activeCombat) return sock.sendMessage(chatJid, { text: '⚔️ Você já está em combate. Use !atacar, !usar_tecnica Nome ou !fugir.' }, quoted ? ({ quoted } as any) : undefined)
  const r = regionOf(c.regionName)
  const enemy = { name: beastName, maxHp: 45 + r.danger * 35 + roll(0, 25), hp: 45 + r.danger * 35 + roll(0, 25), attack: 8 + r.danger * 7, danger: r.danger }
  await prisma.character.update({ where: { id: c.id }, data: { activeCombat: enemy as any, currentActivity: 'COMBATE' } })
  await sock.sendMessage(chatJid, { text: `⚔️ *Combate iniciado!*\n\nUma ameaça surgiu em ${r.name}: *${enemy.name}*\n\n❤️ Inimigo: ${makeBar(enemy.hp, enemy.maxHp)}\n\nComandos:\n!atacar\n!usar_tecnica Nome\n!fugir` }, quoted ? ({ quoted } as any) : undefined)
}

async function finishEnemy(sock: WASocket, chatJid: string, c: any, enemy: any, quoted?: proto.IWebMessageInfo) {
  const r = regionOf(c.regionName); const stones = roll(50, 120 + enemy.danger * 50); const item = pick(r.resources); const inv = asInv(c.inventory); inv[item] = (inv[item] ?? 0) + 1
  await prisma.character.update({ where: { id: c.id }, data: { activeCombat: null, inventory: inv as any, spiritStones: { increment: stones }, wealthEarned: { increment: stones }, bossesKilled: enemy.danger >= 5 ? { increment: 1 } : undefined, spiritExp: { increment: 100 + enemy.danger * 35 }, bodyExp: { increment: 60 + enemy.danger * 25 }, currentActivity: null } })
  await sock.sendMessage(chatJid, { text: `🏆 *Vitória!*\n\nVocê derrotou ${enemy.name}.\n\n💎 +${stones} pedras espirituais\n🎒 ${item} x1\n🌀 +${100 + enemy.danger * 35} cultivo espiritual\n💢 +${60 + enemy.danger * 25} cultivo físico` }, quoted ? ({ quoted } as any) : undefined)
}

export async function attack(sock: WASocket, chatJid: string, userId: string, techName?: string, quoted?: proto.IWebMessageInfo) {
  const c = await needChar(sock, chatJid, userId, quoted); if (!c) return
  const enemy = asObj<any>(c.activeCombat)
  if (!enemy) return sock.sendMessage(chatJid, { text: '⚔️ Você não está em combate. Use !explorar ou !cacar.' }, quoted ? ({ quoted } as any) : undefined)
  let t = techniques[0]
  if (techName) {
    const known = ['Punho Mortal', ...asList(c.knownTechniques)]
    const selected = techniques.find((x) => x.name.toLowerCase() === techName.toLowerCase())
    if (!selected || !known.includes(selected.name)) return sock.sendMessage(chatJid, { text: '📜 Você não conhece essa técnica. Use !tecnicas.' }, quoted ? ({ quoted } as any) : undefined)
    if (c.qi < selected.qiCost) return sock.sendMessage(chatJid, { text: `🔷 Qi insuficiente. ${selected.name} custa ${selected.qiCost}.` }, quoted ? ({ quoted } as any) : undefined)
    t = selected
  }
  const damage = Math.max(1, Math.floor((c.strength * 1.4 + c.spirit * 1.1 + realmPower(c) + roll(0, 12)) * t.power))
  enemy.hp = Math.max(0, enemy.hp - damage)
  if (enemy.hp <= 0) return finishEnemy(sock, chatJid, c, enemy, quoted)
  const dodge = Math.random() * 100 < Math.min(45, c.agility * 1.4 + (t.type === 'movimento' ? 18 : 0))
  const retaliation = dodge ? 0 : Math.max(1, enemy.attack + roll(-4, 8) - Math.floor(c.constitution / 3))
  const newHp = Math.max(0, c.hp - retaliation)
  await prisma.character.update({ where: { id: c.id }, data: { activeCombat: enemy as any, qi: Math.max(0, c.qi - t.qiCost), hp: newHp } })
  if (newHp <= 0) {
    const { damageLifeAndMaybeCreateLegacy } = await import('./characterService.js')
    await damageLifeAndMaybeCreateLegacy(sock, chatJid, c.userId)
    return
  }
  await sock.sendMessage(chatJid, { text: `⚔️ *Rodada de combate*\n\nVocê usou: ${t.name}\nDano causado: ${damage}\n❤️ Inimigo: ${makeBar(enemy.hp, enemy.maxHp)}\n\n${dodge ? '💨 Você esquivou do contra-ataque.' : `💢 Você sofreu ${retaliation} de dano.`}\n❤️ Seu HP: ${makeBar(newHp, c.maxHp)}\n🔷 Seu Qi: ${makeBar(Math.max(0, c.qi - t.qiCost), c.maxQi)}` }, quoted ? ({ quoted } as any) : undefined)
}

export async function flee(sock: WASocket, chatJid: string, userId: string, quoted?: proto.IWebMessageInfo) {
  const c = await needChar(sock, chatJid, userId, quoted); if (!c) return
  if (!c.activeCombat) return sock.sendMessage(chatJid, { text: 'Você não está em combate.' }, quoted ? ({ quoted } as any) : undefined)
  const chance = Math.min(85, 35 + c.agility * 2 + c.luckAttribute)
  if (Math.random() * 100 < chance) {
    await prisma.character.update({ where: { id: c.id }, data: { activeCombat: null, currentActivity: null } })
    return sock.sendMessage(chatJid, { text: '💨 Você escapou por pouco e ocultou sua aura.' }, quoted ? ({ quoted } as any) : undefined)
  }
  await prisma.character.update({ where: { id: c.id }, data: { hp: Math.max(1, c.hp - 18) } })
  await sock.sendMessage(chatJid, { text: '❌ Fuga falhou. Você sofreu 18 de dano tentando escapar.' }, quoted ? ({ quoted } as any) : undefined)
}

export async function showShop(sock: WASocket, chatJid: string, quoted?: proto.IWebMessageInfo) {
  await sock.sendMessage(chatJid, { text: `🏮 *Loja do Bot — Pavilhão do Tesouro*\n\n${botShop.map((i, idx) => `${idx + 1}. ${i.name} — ${i.price} pedras\n   ${i.description}`).join('\n\n')}\n\nUse: !comprar Nome do Item` }, quoted ? ({ quoted } as any) : undefined)
}

export async function buyItem(sock: WASocket, chatJid: string, userId: string, name: string, quoted?: proto.IWebMessageInfo) {
  const c = await needChar(sock, chatJid, userId, quoted); if (!c) return
  const item = botShop.find((i) => i.name.toLowerCase() === name.toLowerCase() || i.id.toLowerCase() === name.toLowerCase())
  if (!item) return sock.sendMessage(chatJid, { text: '❌ Item não encontrado. Use !loja.' }, quoted ? ({ quoted } as any) : undefined)
  if (c.spiritStones < item.price) return sock.sendMessage(chatJid, { text: `💎 Você precisa de ${item.price} pedras espirituais.` }, quoted ? ({ quoted } as any) : undefined)
  const inv = asInv(c.inventory); inv[item.name] = (inv[item.name] ?? 0) + 1
  await prisma.character.update({ where: { id: c.id }, data: { spiritStones: { decrement: item.price }, inventory: inv as any } })
  await sock.sendMessage(chatJid, { text: `✅ Compra realizada: *${item.name}*\n💎 -${item.price}` }, quoted ? ({ quoted } as any) : undefined)
}

export async function useItem(sock: WASocket, chatJid: string, userId: string, name: string, quoted?: proto.IWebMessageInfo) {
  const c = await needChar(sock, chatJid, userId, quoted); if (!c) return
  const inv = asInv(c.inventory); const key = Object.keys(inv).find((k) => k.toLowerCase() === name.toLowerCase())
  if (!key || inv[key] <= 0) return sock.sendMessage(chatJid, { text: '❌ Você não possui esse item.' }, quoted ? ({ quoted } as any) : undefined)
  inv[key] -= 1
  const data: any = { inventory: inv as any }
  let effect = 'Nada especial aconteceu.'
  if (key === 'Pílula de Qi') { data.spiritExp = { increment: 80 }; effect = '+80 cultivo espiritual.' }
  else if (key === 'Pílula de Cura') { data.hp = Math.min(c.maxHp, c.hp + Math.floor(c.maxHp * .45)); effect = 'Você recuperou HP.' }
  else if (key === 'Talismã de Retorno') { data.regionName = 'Vale das Nuvens Partidas'; effect = 'Você retornou ao Vale das Nuvens Partidas.' }
  else if (key === 'Pergaminho de Técnica Aleatória') { const known = asList(c.knownTechniques); const t = pick(techniques.filter((x) => x.name !== 'Punho Mortal')); if (!known.includes(t.name)) known.push(t.name); data.knownTechniques = known as any; effect = `Você aprendeu ${t.name}.` }
  await prisma.character.update({ where: { id: c.id }, data })
  await sock.sendMessage(chatJid, { text: `🧪 *Item usado:* ${key}\n${effect}` }, quoted ? ({ quoted } as any) : undefined)
}

export async function profession(sock: WASocket, chatJid: string, userId: string, arg: string, quoted?: proto.IWebMessageInfo) {
  const c = await needChar(sock, chatJid, userId, quoted); if (!c) return
  const opts = ['Alquimista', 'Ferreiro', 'Mestre de Formações', 'Talismã', 'Domador']
  if (!c.professionName && arg) {
    const p = opts.find((x) => x.toLowerCase() === arg.toLowerCase())
    if (!p) return sock.sendMessage(chatJid, { text: `🛠️ Profissões disponíveis:\n${opts.map((x) => `• ${x}`).join('\n')}\n\nUse: !aprender_profissao Nome` }, quoted ? ({ quoted } as any) : undefined)
    await prisma.character.update({ where: { id: c.id }, data: { professionName: p, professionLevel: 1 } })
    return sock.sendMessage(chatJid, { text: `🛠️ Você iniciou a profissão: *${p}*.` }, quoted ? ({ quoted } as any) : undefined)
  }
  await sock.sendMessage(chatJid, { text: `🛠️ *Profissão*\n\nAtual: ${c.professionName ?? 'Nenhuma'}\nNível: ${c.professionLevel}\nEXP: ${c.professionExp}\n\nDisponíveis:\n${opts.map((x) => `• ${x}`).join('\n')}\n\nUse: !aprender_profissao Nome` }, quoted ? ({ quoted } as any) : undefined)
}

export async function craft(sock: WASocket, chatJid: string, userId: string, kind: string, quoted?: proto.IWebMessageInfo) {
  const c = await needChar(sock, chatJid, userId, quoted); if (!c) return
  if (!c.professionName) return sock.sendMessage(chatJid, { text: '🛠️ Aprenda uma profissão primeiro: !aprender_profissao Alquimista' }, quoted ? ({ quoted } as any) : undefined)
  const inv = asInv(c.inventory)
  const output = kind === 'forja' ? 'Lâmina Espiritual Simples' : kind === 'formacao' ? 'Disco de Formação Menor' : kind === 'talismas' ? 'Talismã de Proteção' : 'Pílula de Qi'
  inv[output] = (inv[output] ?? 0) + 1
  await prisma.character.update({ where: { id: c.id }, data: { inventory: inv as any, professionExp: { increment: 45 } } })
  await sock.sendMessage(chatJid, { text: `🛠️ *Criação concluída*\n\nProfissão: ${c.professionName}\nResultado: ${output}\n+45 EXP de profissão` }, quoted ? ({ quoted } as any) : undefined)
}

export async function createSect(sock: WASocket, chatJid: string, userId: string, name: string, quoted?: proto.IWebMessageInfo) {
  const c = await needChar(sock, chatJid, userId, quoted); if (!c) return
  if (c.sectName !== 'Nenhuma') return sock.sendMessage(chatJid, { text: '🛕 Você já pertence a uma seita.' }, quoted ? ({ quoted } as any) : undefined)
  const cost = 2500
  if (c.spiritStones < cost) return sock.sendMessage(chatJid, { text: `🛕 Criar uma seita custa ${cost} pedras espirituais.` }, quoted ? ({ quoted } as any) : undefined)
  await prisma.character.update({ where: { id: c.id }, data: { sectName: name, sectRole: 'Líder da Seita', foundedSect: true, spiritStones: { decrement: cost }, reputation: { increment: 20 } } })
  await sock.sendMessage(chatJid, { text: `🛕 *Seita fundada!*\n\n${name}\nFundador: ${c.name}\n\nDiscípulos agora podem ser organizados em missões, técnicas e tesouro da seita nas próximas expansões.` }, quoted ? ({ quoted } as any) : undefined)
}

export async function showSect(sock: WASocket, chatJid: string, userId: string, quoted?: proto.IWebMessageInfo) {
  const c = await needChar(sock, chatJid, userId, quoted); if (!c) return
  await sock.sendMessage(chatJid, { text: `🛕 *Seita*\n\nNome: ${c.sectName}\nCargo: ${c.sectRole ?? 'Nenhum'}\nReputação pessoal: ${c.reputation}\n\nUse !criarseita Nome para fundar uma seita se ainda não tiver uma.` }, quoted ? ({ quoted } as any) : undefined)
}

export async function ranks(sock: WASocket, chatJid: string, type: string, quoted?: proto.IWebMessageInfo) {
  const orderBy: any = type === 'riqueza' ? { spiritStones: 'desc' } : type === 'karma' ? { karmaValue: 'desc' } : type === 'pvp' ? { bossesKilled: 'desc' } : { spiritRealmIndex: 'desc' }
  const chars = await prisma.character.findMany({ where: { active: true }, take: 10, orderBy })
  const lines = chars.map((c: any, i: number) => `${i + 1}. ${c.name} — ${type === 'riqueza' ? `${c.spiritStones} pedras` : type === 'karma' ? `${c.karmaValue} karma` : `${c.spiritRealm} ${c.spiritStage}`}`)
  await sock.sendMessage(chatJid, { text: `🏆 *Ranking ${type || 'cultivo'}*\n\n${lines.length ? lines.join('\n') : 'Nenhum personagem no ranking.'}` }, quoted ? ({ quoted } as any) : undefined)
}

export async function destinyInfo(sock: WASocket, chatJid: string, userId: string, quoted?: proto.IWebMessageInfo) {
  const c = await needChar(sock, chatJid, userId, quoted); if (!c) return
  await sock.sendMessage(chatJid, { text: `🌌 *Destino e Karma*\n\nDestino: ${c.destinyName} Nv.${c.destinyLevel}\nSorte: ${c.luckName} Nv.${c.luckLevel}\nKarma: ${c.karmaTitle} (${c.karmaValue >= 0 ? '+' : ''}${c.karmaValue})\nVidas: ${c.lives}/${c.maxLives}\nReputação: ${c.reputation}\n\nAo perder as 9 vidas, seus feitos viram Pontos de Destino para a próxima encarnação.` }, quoted ? ({ quoted } as any) : undefined)
}
