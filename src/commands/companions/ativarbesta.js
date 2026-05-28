const Player = require('../../models/Player');
const { setActiveCompanion } = require('../../services/companions');

module.exports = {
  name: 'ativarbesta',
  aliases: ['ativarcompanheiro', 'ativarpets'],
  async execute({ sock, from, sender, args }) {
    const phone = sender.split('@')[0];
    console.log(`[ativarbesta] Jogador ${phone} solicitou ativar besta com args: ${args.join(' ')}`);

    const player = await Player.findOne({ phone });

    if (!player) {
      console.log('[ativarbesta] Jogador sem personagem.');
      return sock.sendMessage(from, { text: 'Você ainda não possui um personagem. Use !registrar para iniciar sua jornada.' });
    }

    if (!args.length) {
      return sock.sendMessage(from, { text: 'Uso: !ativarbesta NomeDaBesta\nExemplo: !ativarbesta Coelho de Grama Espiritual' });
    }

    const nameOrId = args.join(' ');

    const active = await setActiveCompanion(player, nameOrId);
    if (!active) {
      console.log('[ativarbesta] Nenhum companheiro encontrado com esse nome/ID.');
      return sock.sendMessage(from, { text: 'Você não possui um companheiro com esse nome. Use !companheiros para ver a lista.' });
    }

    console.log(`[ativarbesta] ${player.name} ativou ${active.name} como companheiro.`);
    await sock.sendMessage(from, { text: `🐾 ${active.name} agora caminha ao seu lado. Seu Qi se entrelaça com o seu em futuras batalhas.` });
  },
};
