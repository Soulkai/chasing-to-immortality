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

  // Decide qual trilha essa técnica afeta
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
  // Verifica limite semanal (campo será adicionado depois, placeholder por enquanto)
  const now = Date.now();
  const last = player.cooldowns.cultivate;
  const remaining = getCooldownRemaining(last, THREE_HOURS_MS);

  if (remaining > 0) {
    return sock.sendMessage(from, { text: `Seu corpo ainda está se ajustando ao último cultivo. Aguarde ${formatCooldown(remaining)}.` });
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

  // Cálculo simples de XP por enquanto, será refinado depois
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

  // Up de sub-nível / reino (lógica simples inicial)
  while (cultivation.xp >= cultivation.xpNeeded) {
    cultivation.xp -= cultivation.xpNeeded;
    cultivation.subLevel += 1;

    if (cultivation.subLevel > 9) {
      cultivation.subLevel = 1;
      cultivation.realm += 1;
      // aumenta dificuldade
      cultivation.xpNeeded = Math.floor(cultivation.xpNeeded * 1.6);
    } else {
      cultivation.xpNeeded = Math.floor(cultivation.xpNeeded * 1.2);
    }
  }

  // Atualiza cooldown
  player.cooldowns.cultivate = new Date(now);

  // Salva alterações na trilha correta
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
  text += `🕊️ Reino atual: ${realmName}`;

  await sock.sendMessage(from, { text });
}

async function startClosedCultivation({ sock, from, player }) {
  // Placeholder: apenas mensagem por enquanto, lógica completa será adicionada depois
  await sock.sendMessage(from, { text: '🕯️ Cultivo recluso ainda está em preparação. Quando estiver pronto, você poderá entrar em isolamento por uma semana em troca de um grande salto no caminho.' });
}
