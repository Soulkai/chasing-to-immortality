const Player = require('../../models/Player');

module.exports = {
  name: 'setaparencia',
  aliases: ['avatar', 'setavatar', 'setaparência'],
  async execute({ sock, msg, from, sender, args }) {
    const phone = sender.split('@')[0];
    const player = await Player.findOne({ phone });

    if (!player) {
      return sock.sendMessage(from, { text: 'Você ainda não possui um personagem. Use !registrar para iniciar sua jornada.' });
    }

    if (!args.length) {
      return sock.sendMessage(from, { text: 'Uso: !setaparencia URL_da_imagem_ou_gif\nEssa URL será usada como aparência do seu personagem no !perfil e em outras interações.' });
    }

    const url = args[0].trim();

    if (!/^https?:\/\//i.test(url)) {
      return sock.sendMessage(from, { text: 'A URL deve começar com http:// ou https://.' });
    }

    if (url.length > 500) {
      return sock.sendMessage(from, { text: 'A URL é muito longa. Use um link mais curto.' });
    }

    player.avatarUrl = url;
    await player.save();

    await sock.sendMessage(from, { text: '🖼️ Aparência atualizada com sucesso! Use !perfil para ver como ficou.' });
  },
};
