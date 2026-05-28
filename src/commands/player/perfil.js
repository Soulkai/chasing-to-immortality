const Player = require('../../models/Player');
const { getRealmName } = require('../../data/realms');
const { rarityEmoji, progressBar } = require('../../utils/format');

module.exports = {
  name: 'perfil',
  aliases: ['profile', 'status'],
  async execute({ sock, msg, from, sender }) {
    const phone = sender.split('@')[0];
    const player = await Player.findOne({ phone }).populate('sect');
    if (!player) {
      return sock.sendMessage(from, { text: 'Você ainda não possui um personagem. Use !registrar para iniciar sua jornada.' });
    }

    const qiName = getRealmName(player.qiCultivation.realm, player.qiCultivation.subLevel, 'qi');
    const bodyName = getRealmName(player.bodyCultivation.realm, player.bodyCultivation.subLevel, 'body');
    const mindName = getRealmName(player.mindCultivation.realm, player.mindCultivation.subLevel, 'mind');

    const talents = player.talents || [];
    const raiz = talents.find(t => ['epic','legendary','mythic','transcendent'].includes(t.rarity) && t.name.startsWith('Raiz'));
    const corpoDivino = talents.find(t => ['legendary','mythic','transcendent'].includes(t.rarity) && t.name.startsWith('Corpo'));

    const hpBar = progressBar(player.attributes.hp, player.attributes.maxHp, 10);
    const qiBar = progressBar(player.attributes.qi, player.attributes.maxQi, 10);

    const talentosText = talents.length
      ? talents.map(t => `${rarityEmoji(t.rarity)} ${t.name}`).join('\n')
      : 'Nenhum talento especial';

    const sectText = player.sect ? player.sect.name : 'Nenhuma';
    const avatarText = player.avatarUrl || 'Nenhuma definida (use !setaparencia URL)';

    const text = `👤 Perfil de ${player.name}\n` +
      `🖼️ Aparência: ${avatarText}\n` +
      `🧬 Raça: ${player.race} (${player.raceRarity})\n` +
      `🏛️ Clã de Origem: ${player.clan}\n` +
      `🌟 Talentos:\n${talentosText}\n` +
      `🌱 Raiz: ${raiz ? raiz.name : 'Nenhuma raiz especial'}\n` +
      `✨ Corpo Divino: ${corpoDivino ? corpoDivino.name : 'Nenhum'}\n` +
      `📍 Região: ${player.region} — ${player.location}\n` +
      `🛕 Seita: ${sectText}\n\n` +
      `💢 Corpo: ${bodyName}\n` +
      `🌀 Espírito: ${qiName}\n` +
      `👁️ Alma: ${mindName}\n` +
      `❤️ HP ${hpBar} ${player.attributes.hp}/${player.attributes.maxHp}\n` +
      `🔷 Qi ${qiBar} ${player.attributes.qi}/${player.attributes.maxQi}\n\n` +
      `📊 Atributos:\n` +
      `🗡️ Força: ${player.attributes.strength}\n` +
      `🏃 Agilidade: ${player.attributes.agility}\n` +
      `🛡️ Resistência: ${player.attributes.endurance}\n` +
      `🧠 Espírito: ${player.attributes.spirit}\n` +
      `👁️ Percepção: ${player.attributes.perception}\n` +
      `🪬 Vontade: ${player.attributes.willpower}\n` +
      `💬 Carisma: ${player.attributes.charisma}\n` +
      `🍀 Sorte: ${player.attributes.luck}\n` +
      `⚖️ Karma: ${player.attributes.karma}`;

    await sock.sendMessage(from, { text });
  },
};
