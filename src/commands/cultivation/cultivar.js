const Player = require('../../models/Player');
const Technique = require('../../models/Technique');
const { getCooldownRemaining, formatCooldown } = require('../../utils/cooldown');
const { getRealmName } = require('../../data/realms');
const { rarityEmoji, progressBar } = require('../../utils/format');

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_WEEKLY_SESSIONS = 10;

module.exports = {
  name: 'cultivar',
  aliases: ['cultivo'],
  async execute({ sock, msg, from, sender, args }) {
    const phone = sender.split('@')[0];
    const player = await Player.findOne({ phone }).populate('qiCultivation.technique bodyCultivation.technique mindCultivation.technique');

    if (!player) {
      return sock.sendMessage(from, { text: 'Você ainda não possui um personagem. Use !registrar para iniciar sua jornada.' });
    }

    const subcommand = (args[0] || '').toLowerCase();

    if (subcommand === 'set') {
      return setCultivationTechnique({ sock, from, player, args: args.slice(1) });
    }

    if (subcommand === 'recluso') {
      return startClosedCultivation({ sock, from, player });
    }

    return normalCultivation({ sock, from, player });
  },
};

async function setCultivationTechnique({ sock, from, player, args }) {
  if (!args.length) {
    return sock.sendMessage(from, { text: 'Uso: !cultivar set nome_da_técnica\nExemplo: !cultivar set Respiração do Dragão Celestial' });
  }

  const name = args.join(' ');

  const technique = await Technique.findOne({ name });
  if (!technique) {
    return sock.sendMessage(from, { text: `Não foi encontrada nenhuma técnica chamada "${name}".` });
  }

  if (technique.cultivationType === 'qi') {
    player.qiCultivation.technique = technique._id;
  } else if (technique.cultivationType === 'body') {
    player.bodyCultivation.technique = technique._id;
  } else if (technique.cultivationType === 'mind') {
    player.mindCultivation.technique = technique._id;
  }

  await player.save();

  await sock.sendMessage(from, { text: `🧘 Técnica de cultivo ajustada para: ${technique.name} (${technique.cultivationType}).` });
}

async function normalCultivation({ sock, from, player }) {
  const now = Date.now();

  if (player.isInClosedCultivation && player.closedCultivationEndAt && now < new Date(player.closedCultivationEndAt).getTime()) {
    const remaining = new Date(player.closedCultivationEndAt).getTime() - now;
    return sock.sendMessage(from, { text: `🕯️ Você está em cultivo recluso. Restam ${formatCooldown(remaining)} até o fim do isolamento.` });
  }

  // Reset semanal do limite de sessões
  if (!player.weeklyCultivationReset || now - new Date(player.weeklyCultivationReset).getTime() >= ONE_WEEK_MS) {
    player.weeklyCultivationReset = new Date(now);
    player.weeklyCultivationCount = 0;
  }

  if (player.weeklyCultivationCount >= MAX_WEEKLY_SESSIONS) {
    return sock.sendMessage(from, { text: '⏳ Você já alcançou o limite de 10 sessões de cultivo nesta semana. Busque experiências no mundo ou tente cultivo recluso.' });
  }

  const last = player.cooldowns.cultivate;
  const remainingCd = getCooldownRemaining(last, THREE_HOURS_MS);

  if (remainingCd > 0) {
    return sock.sendMessage(from, { text: `Seu corpo ainda está se ajustando ao último cultivo. Aguarde ${formatCooldown(remainingCd)}.` });
  }

  // Escolhe técnica ativa: prioriza Qi, depois Corpo, depois Mente
  let path = null;
  let cultivation = null;
  let technique = null;

  if (player.qiCultivation.technique) {
    path = 'qi';
    cultivation = player.qiCultivation;
    technique = await Technique.findById(player.qiCultivation.technique);
  } else if (player.bodyCultivation.technique) {
    path = 'body';
    cultivation = player.bodyCultivation;
    technique = await Technique.findById(player.bodyCultivation.technique);
  } else if (player.mindCultivation.technique) {
    path = 'mind';
    cultivation = player.mindCultivation;
    technique = await Technique.findById(player.mindCultivation.technique);
  }

  if (!technique) {
    return sock.sendMessage(from, { text: 'Você não possui uma técnica de cultivo equipada. Use !cultivar set nome_da_técnica após obter uma.' });
  }

  const { attributes } = player;
  let baseXp = 10;

  if (path === 'qi') {
    baseXp += attributes.spirit * 0.5 + attributes.perception * 0.2;
  } else if (path === 'body') {
    baseXp += attributes.endurance * 0.5 + attributes.strength * 0.3;
  } else if (path === 'mind') {
    baseXp += attributes.spirit * 0.4 + attributes.perception * 0.4;
  }

  baseXp *= technique.xpBonus || 1.0;

  const xpGain = Math.floor(baseXp);
  cultivation.xp += xpGain;

  while (cultivation.xp >= cultivation.xpNeeded) {
    cultivation.xp -= cultivation.xpNeeded;
    cultivation.subLevel += 1;

    if (cultivation.subLevel > 9) {
      cultivation.subLevel = 1;
      cultivation.realm += 1;
      cultivation.xpNeeded = Math.floor(cultivation.xpNeeded * 1.6);
    } else {
      cultivation.xpNeeded = Math.floor(cultivation.xpNeeded * 1.2);
    }
  }

  player.cooldowns.cultivate = new Date(now);
  player.weeklyCultivationCount += 1;

  if (path === 'qi') player.qiCultivation = cultivation;
  if (path === 'body') player.bodyCultivation = cultivation;
  if (path === 'mind') player.mindCultivation = cultivation;

  await player.save();

  const realmName = getRealmName(cultivation.realm, cultivation.subLevel, path === 'qi' ? 'qi' : path === 'body' ? 'body' : 'mind');
  const bar = progressBar(cultivation.xp, cultivation.xpNeeded, 10);

  let text = `🧘 Você entra em cultivo utilizando a técnica ${technique.name}.\n`;
  text += `Caminho cultivado: ${path === 'qi' ? '🌀 Qi Espiritual' : path === 'body' ? '💢 Corpo' : '👁️ Alma'}\n`;
  text += `✨ Ganho de XP: +${xpGain} XP\n`;
  text += `📈 Progresso: ${bar} ${cultivation.xp}/${cultivation.xpNeeded}\n`;
  text += `🕊️ Reino atual: ${realmName}\n`;
  text += `⏳ Sessões de cultivo nesta semana: ${player.weeklyCultivationCount}/${MAX_WEEKLY_SESSIONS}`;

  await sock.sendMessage(from, { text });
}

async function startClosedCultivation({ sock, from, player }) {
  const now = Date.now();

  if (player.isInClosedCultivation && player.closedCultivationEndAt && now < new Date(player.closedCultivationEndAt).getTime()) {
    const remaining = new Date(player.closedCultivationEndAt).getTime() - now;
    return sock.sendMessage(from, { text: `🕯️ Você já está em cultivo recluso. Restam ${formatCooldown(remaining)} até o fim do isolamento.` });
  }

  const endAt = new Date(now + ONE_WEEK_MS);
  player.isInClosedCultivation = true;
  player.closedCultivationEndAt = endAt;
  await player.save();

  await sock.sendMessage(from, { text: '🕯️ Você inicia um cultivo recluso de portas fechadas por 7 dias. Durante esse período, não poderá realizar ações normais. No futuro, falta de alimento poderá causar desgaste ou morte — prepare-se bem antes de se isolar.' });
}
