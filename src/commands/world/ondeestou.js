const Region = require('../../models/Region');
const Player = require('../../models/Player');

module.exports = {
  name: 'ondeestou',
  aliases: ['local', 'posicao', 'posição'],
  async execute({ sock, from, sender }) {
    const phone = sender.split('@')[0];
    console.log(`[ondeestou] Requisição de localização por ${phone} em ${from}`);

    const player = await Player.findOne({ phone }).populate('currentRegion');
    if (!player) {
      console.log('[ondeestou] Nenhum personagem encontrado para o jogador.');
      return sock.sendMessage(from, { text: 'Você ainda não possui um personagem. Use !registrar para iniciar sua jornada.' });
    }

    let region = player.currentRegion;
    if (!region && player.location) {
      region = await Region.findOne({ name: player.location });
    }

    if (!region) {
      console.warn(`[ondeestou] Região não encontrada para jogador ${phone} na location: ${player.location}`);
      return sock.sendMessage(from, { text: 'Seu corpo está no mundo, mas o Dao não reconhece sua localização. Avise um ancião (dev) para ajustar suas Terras.' });
    }

    const parts = [];
    if (region.worldName) parts.push(`🌌 Mundo: ${region.worldName}`);
    if (region.empireName) parts.push(`🛕 Império: ${region.empireName}`);
    if (region.kingdomName) parts.push(`👑 Reino: ${region.kingdomName}`);
    parts.push(`🏙️ Cidade: ${region.name}`);

    const danger = region.dangerLevel || 1;
    let dangerText = 'Levemente perigoso';
    if (danger >= 4 && danger <= 6) dangerText = 'Perigoso';
    if (danger >= 7 && danger <= 8) dangerText = 'Extremamente perigoso';
    if (danger >= 9) dangerText = 'Região onde até imortais caem';

    const qiRange = `Reinos de Qi recomendados: ${region.minRealmQi || 0} até ${region.maxRealmQi || 1}`;

    let text = `📍 Sua posição atual:\n\n`;
    text += parts.join('\n') + '\n\n';
    text += `⚠️ Periculosidade: ${danger}/10 (${dangerText})\n`;
    text += `🌀 ${qiRange}`;

    console.log(`[ondeestou] Enviando informações da região '${region.name}' com perigo ${danger} para ${phone}.`);
    await sock.sendMessage(from, { text });
  },
};
