const Region = require('../../models/Region');
const Player = require('../../models/Player');

module.exports = {
  name: 'viajar',
  aliases: ['viajarpara', 'travel'],
  async execute({ sock, from, sender, args }) {
    const phone = sender.split('@')[0];

    const player = await Player.findOne({ phone });
    if (!player) {
      return sock.sendMessage(from, { text: 'Você ainda não possui um personagem. Use !registrar para iniciar sua jornada.' });
    }

    if (!args.length) {
      return sock.sendMessage(from, { text: 'Uso: !viajar NomeDaCidade\nExemplo: !viajar Cidade Calma' });
    }

    const targetName = args.join(' ');

    const targetRegion = await Region.findOne({ name: targetName });
    if (!targetRegion) {
      return sock.sendMessage(from, { text: 'Os mapas do mundo não reconhecem esse destino. Verifique o nome da cidade.' });
    }

    const currentRegion = await Region.findOne({ name: player.location });

    // Regra simples: viagem entre mundos/impérios/reinos distantes será mais custosa depois.
    // Por enquanto, apenas alerta de perigo se a diferença de perigo for muito grande.
    const dangerDiff = (targetRegion.dangerLevel || 1) - (currentRegion?.dangerLevel || 1);
    if (dangerDiff >= 3) {
      await sock.sendMessage(from, { text: '⚠️ O destino que você escolheu é significativamente mais perigoso do que sua região atual. Se insistir em ir, esteja preparado para morrer.' });
    }

    player.location = targetRegion.name;
    player.region = targetRegion.name;
    await player.save();

    let text = `🧭 Você decide partir em direção a ${targetRegion.name}.\n`;
    text += `Após uma longa viagem, seus passos finalmente param diante dos portões da cidade.\n\n`;
    text += `Use !ondeestou para sentir melhor o Qi e a periculosidade deste lugar.`;

    await sock.sendMessage(from, { text });
  },
};
