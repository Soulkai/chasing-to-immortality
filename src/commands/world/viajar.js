const Region = require('../../models/Region');
const Player = require('../../models/Player');

module.exports = {
  name: 'viajar',
  aliases: ['viajarpara', 'travel'],
  async execute({ sock, from, sender, args }) {
    const phone = sender.split('@')[0];
    console.log(`[viajar] Jogador ${phone} pediu viagem com args: ${args.join(' ')}`);

    const player = await Player.findOne({ phone });
    if (!player) {
      console.log('[viajar] Jogador sem personagem tentando viajar.');
      return sock.sendMessage(from, { text: 'Você ainda não possui um personagem. Use !registrar para iniciar sua jornada.' });
    }

    if (!args.length) {
      return sock.sendMessage(from, { text: 'Uso: !viajar NomeDaCidade\nExemplo: !viajar Cidade Calma' });
    }

    const targetName = args.join(' ');

    const targetRegion = await Region.findOne({ name: targetName });
    if (!targetRegion) {
      console.warn(`[viajar] Destino '${targetName}' não encontrado para jogador ${phone}.`);
      return sock.sendMessage(from, { text: 'Os mapas do mundo não reconhecem esse destino. Verifique o nome da cidade.' });
    }

    const currentRegion = await Region.findOne({ name: player.location });

    const dangerDiff = (targetRegion.dangerLevel || 1) - (currentRegion?.dangerLevel || 1);
    if (dangerDiff >= 3) {
      console.log(`[viajar] Aviso de alta diferença de perigo para ${phone}: de ${currentRegion?.dangerLevel || 1} para ${targetRegion.dangerLevel || 1}.`);
      await sock.sendMessage(from, { text: '⚠️ O destino que você escolheu é significativamente mais perigoso do que sua região atual. Se insistir em ir, esteja preparado para morrer.' });
    }

    player.location = targetRegion.name;
    player.region = targetRegion.name;
    await player.save();

    console.log(`[viajar] Jogador ${phone} agora está em '${targetRegion.name}'.`);

    let text = `🧭 Você decide partir em direção a ${targetRegion.name}.\n`;
    text += `Após uma longa viagem, seus passos finalmente param diante dos portões da cidade.\n\n`;
    text += `Use !ondeestou para sentir melhor o Qi e a periculosidade deste lugar.`;

    await sock.sendMessage(from, { text });
  },
};
