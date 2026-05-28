const Player = require('../../models/Player');
const Beast = require('../../models/Beast');

module.exports = {
  name: 'companheiros',
  aliases: ['besta', 'bestas', 'pets'],
  async execute({ sock, from, sender }) {
    const phone = sender.split('@')[0];
    const player = await Player.findOne({ phone }).populate('companions.beast');

    if (!player) {
      return sock.sendMessage(from, { text: 'Você ainda não possui um personagem. Use !registrar para iniciar sua jornada.' });
    }

    if (!player.companions || player.companions.length === 0) {
      return sock.sendMessage(from, { text: 'Nenhuma besta ou companheiro segue seus passos ainda. Domine criaturas em suas explorações para formar laços.' });
    }

    let text = '🐾 Companheiros que caminham ao seu lado:\n\n';

    for (const c of player.companions) {
      const beast = c.beast && c.beast.name ? c.beast : await Beast.findById(c.beast);
      if (!beast) continue;

      text += `${c.isActive ? '⭐' : '•'} ${c.name} (${beast.rarity}) — papel: ${c.role || 'combat'}\n`;
      text += `   Vínculo: ${c.bond || 0}/100\n`;
    }

    text += '\nUse !ativarbesta NomeDaBesta para escolher quem estará ao seu lado em combate.';

    await sock.sendMessage(from, { text });
  },
};
