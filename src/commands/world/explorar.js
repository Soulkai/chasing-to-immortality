const Region = require('../../models/Region');
const Player = require('../../models/Player');
const Beast = require('../../models/Beast');
const Item = require('../../models/Item');
const { addCompanionBeast, computeCompanionBonus } = require('../../services/companions');

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
    const roll = Math.random();

    if (roll < 0.15) {
      const text = `🌫️ Você vaga por ${region.name}, sentindo o Qi sutil no ar. Nada significativo acontece... desta vez.`;
      return sock.sendMessage(from, { text });
    }

    const combatThreshold = 0.4 - danger * 0.02;

    if (roll >= combatThreshold) {
      if (!region.beasts || region.beasts.length === 0) {
        return sock.sendMessage(from, { text: 'Você sente presenças distantes, mas nada ousa se aproximar de você ainda.' });
      }

      const beastId = randomOf(region.beasts);
      const beast = await Beast.findById(beastId);

      if (!beast) {
        return sock.sendMessage(from, { text: 'O Qi de uma criatura toca sua percepção, mas se dissipa. Parece que algo falhou na teia do destino.' });
      }

      const companionBonus = await computeCompanionBonus(player);

      const playerPower =
        (player.attributes.attack || 10) +
        (player.attributes.defense || 8) +
        (player.attributes.maxHp || 50) / 10 +
        companionBonus.attack +
        companionBonus.defense;

      const beastPower =
        (beast.baseStats.attack || 5) +
        (beast.baseStats.defense || 5) +
        (beast.baseStats.hp || 40) / 10 +
        danger;

      let text = `🩸 Enquanto explora ${region.name}, você é cercado por ${beast.name}!\n`;

      if (playerPower + Math.random() * 10 < beastPower + Math.random() * 5) {
        player.attributes.hp = 0;
        player.lives -= 1;
        await player.save();

        const livesLeft = player.lives;
        text += `\nA luta é brutal. Mesmo com todo seu esforço, o mundo escurece diante de seus olhos.\n`;

        if (livesLeft > 0) {
          text += `☠️ Você morreu. O fio do destino ainda guarda ${livesLeft} vida(s) para você renascer em outra oportunidade.`;
        } else {
          text += '☠️ Você morreu e suas vidas se esgotaram. Talvez um dia, em outra era, sua alma retorne a este mundo.';
        }

        return sock.sendMessage(from, { text });
      }

      // Vitória: chance de domar e chance de loot
      text += `\nVocê canaliza seu Qi e, após trocas intensas de golpes, consegue subjugar a criatura.`;

      const tamePossible = beast.tamable;
      const tameRoll = Math.random();
      let tamed = false;

      if (tamePossible && tameRoll > 0.6) {
        await addCompanionBeast(player, beast);
        tamed = true;
        text += `\n🐾 Em vez de dar o golpe final, você estende seu sentido espiritual. ${beast.name} abaixa a cabeça: ele agora reconhece você como mestre.`;
      }

      const lootRoll = Math.random();
      if (lootRoll > 0.4) {
        const lootItems = await Item.find({ type: { $in: ['material', 'pill'] } });
        if (lootItems.length) {
          const found = randomOf(lootItems);
          player.inventory.push({ item: found._id, quantity: 1 });
          await player.save();
          text += `\n📦 Revistando o local da batalha, você encontra: ${found.name}.`;
        }
      }

      if (!tamed) {
        text += '\n⚔️ A batalha deixou marcas em sua mente. Em breve, você poderá transformar isso em progresso no cultivo.';
      }

      return sock.sendMessage(from, { text });
    }

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
