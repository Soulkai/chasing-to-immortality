const Region = require('../../models/Region');
const Player = require('../../models/Player');
const Beast = require('../../models/Beast');
const Item = require('../../models/Item');

function randomOf(array) {
  return array[Math.floor(Math.random() * array.length)];
}

module.exports = {
  name: 'explorar',
  aliases: ['explore', 'aventurar'],
  async execute({ sock, from, sender }) {
    const phone = sender.split('@')[0];

    const player = await Player.findOne({ phone });
    if (!player) {
      return sock.sendMessage(from, { text: 'Você ainda não possui um personagem. Use !registrar para iniciar sua jornada.' });
    }

    if (player.isInClosedCultivation) {
      return sock.sendMessage(from, { text: 'Você está em cultivo recluso. O mundo lá fora não existe até que você saia desse estado.' });
    }

    const region = await Region.findOne({ name: player.location });
    if (!region) {
      return sock.sendMessage(from, { text: 'As linhas do destino não reconhecem sua localização. Peça a um ancião (dev) para ajustar as regiões.' });
    }

    const danger = region.dangerLevel || 1;

    // Exploração perigosa: chance real de combate pesado ou morte, principalmente em regiões de alto perigo
    // Distribuição simples: quanto maior o danger, mais chances de combate.
    const roll = Math.random();

    if (roll < 0.15) {
      // Evento neutro/ambiental
      const text = `🌫️ Você vaga por ${region.name}, sentindo o Qi sutil no ar. Nada significativo acontece... desta vez.`;
      return sock.sendMessage(from, { text });
    }

    // Combate mais provável em regiões perigosas
    const combatThreshold = 0.4 - danger * 0.02; // cai com o danger

    if (roll >= combatThreshold) {
      // Encontro com criatura
      if (!region.beasts || region.beasts.length === 0) {
        return sock.sendMessage(from, { text: 'Você sente presenças distantes, mas nada ousa se aproximar de você ainda.' });
      }

      const beastId = randomOf(region.beasts);
      const beast = await Beast.findById(beastId);

      if (!beast) {
        return sock.sendMessage(from, { text: 'O Qi de uma criatura toca sua percepção, mas se dissipa. Parece que algo falhou na teia do destino.' });
      }

      // Cálculo super simples de combate por enquanto: se ataque+def do player forem muito menores que os da besta, risco de morte
      const playerPower = (player.attributes.attack || 10) + (player.attributes.defense || 8) + (player.attributes.maxHp || 50) / 10;
      const beastPower = (beast.baseStats.attack || 5) + (beast.baseStats.defense || 5) + (beast.baseStats.hp || 40) / 10;

      let text = `🩸 Enquanto explora ${region.name}, você é cercado por ${beast.name}!\n`;

      if (playerPower + Math.random() * 10 < beastPower + danger) {
        // Derrota/morte
        player.attributes.hp = 0;
        player.lives -= 1;
        await player.save();

        const livesLeft = player.lives;
        text += `\nA luta é brutal. Seu corpo cai, incapaz de resistir ao ataque.\n`;

        if (livesLeft > 0) {
          text += `☠️ Você morreu. No entanto, o fio do destino ainda guarda ${livesLeft} vida(s) para você renascer em outra oportunidade.`;
        } else {
          text += '☠️ Você morreu e suas vidas se esgotaram. Talvez um dia, em outra era, sua alma retorne a este mundo.';
        }

        return sock.sendMessage(from, { text });
      }

      // Vitória simples – sem loot ainda, só narrativa
      text += `\nVocê canaliza seu Qi e, após trocas intensas de golpes, consegue afastar a ameaça.\n`;
      text += '⚔️ A batalha deixou marcas em sua mente. Em breve, você poderá transformar isso em progresso no cultivo.';

      return sock.sendMessage(from, { text });
    }

    // Caso contrário, tentativa de recurso simples
    const items = await Item.find({});
    if (!items.length) {
      return sock.sendMessage(from, { text: 'Você sente que a terra guarda segredos, mas ainda não há nada definido para encontrar aqui.' });
    }

    const found = randomOf(items);
    player.inventory.push({ item: found._id, quantity: 1 });
    await player.save();

    const text = `🌿 Vasculhando os arredores de ${region.name}, você encontra: ${found.name}.\nEle foi guardado com cuidado em seu inventário.`;

    await sock.sendMessage(from, { text });
  },
};
