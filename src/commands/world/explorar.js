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
    console.log(`[explorar] Jogador ${phone} iniciou exploração em ${from}.`);

    const player = await Player.findOne({ phone });
    if (!player) {
      console.log('[explorar] Jogador sem personagem tentando explorar.');
      return sock.sendMessage(from, { text: 'Você ainda não possui um personagem. Use !registrar para iniciar sua jornada.' });
    }

    if (player.isInClosedCultivation) {
      console.log('[explorar] Jogador em cultivo recluso tentou explorar.');
      return sock.sendMessage(from, { text: 'Você está em cultivo recluso. O mundo lá fora não existe até que você saia desse estado.' });
    }

    const region = await Region.findOne({ name: player.location });
    if (!region) {
      console.warn(`[explorar] Região não encontrada para jogador ${phone} em location '${player.location}'.`);
      return sock.sendMessage(from, { text: 'As linhas do destino não reconhecem sua localização. Peça a um ancião (dev) para ajustar as regiões.' });
    }

    const danger = region.dangerLevel || 1;
    const roll = Math.random();

    console.log(`[explorar] Região '${region.name}' perigo=${danger}, roll inicial=${roll.toFixed(3)} para ${phone}.`);

    if (roll < 0.15) {
      const text = `🌫️ Você vaga por ${region.name}, sentindo o Qi sutil no ar. Nada significativo acontece... desta vez.`;
      console.log('[explorar] Evento neutro disparado.');
      return sock.sendMessage(from, { text });
    }

    const combatThreshold = 0.4 - danger * 0.02;

    if (roll >= combatThreshold) {
      console.log(`[explorar] Combate disparado (threshold=${combatThreshold.toFixed(3)}).`);
      if (!region.beasts || region.beasts.length === 0) {
        console.log('[explorar] Região sem bestas ligadas.');
        return sock.sendMessage(from, { text: 'Você sente presenças distantes, mas nada ousa se aproximar de você ainda.' });
      }

      const beastId = randomOf(region.beasts);
      const beast = await Beast.findById(beastId);

      if (!beast) {
        console.warn('[explorar] Beast ID inválido na região.');
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

      console.log(`[explorar] Combate ${player.name} vs ${beast.name}: playerPower=${playerPower.toFixed(2)}, beastPower=${beastPower.toFixed(2)}.`);

      let text = `🩸 Enquanto explora ${region.name}, você é cercado por ${beast.name}!\n`;

      if (playerPower + Math.random() * 10 < beastPower + Math.random() * 5) {
        player.attributes.hp = 0;
        player.lives -= 1;
        await player.save();

        const livesLeft = player.lives;
        console.warn(`[explorar] ${player.name} morreu para ${beast.name}. Vidas restantes: ${livesLeft}.`);

        text += `\nA luta é brutal. Mesmo com todo seu esforço, o mundo escurece diante de seus olhos.\n`;

        if (livesLeft > 0) {
          text += `☠️ Você morreu. O fio do destino ainda guarda ${livesLeft} vida(s) para você renascer em outra oportunidade.`;
        } else {
          text += '☠️ Você morreu e suas vidas se esgotaram. Talvez um dia, em outra era, sua alma retorne a este mundo.';
        }

        return sock.sendMessage(from, { text });
      }

      text += `\nVocê canaliza seu Qi e, após trocas intensas de golpes, consegue subjugar a criatura.`;

      const tamePossible = beast.tamable;
      const tameRoll = Math.random();
      let tamed = false;

      if (tamePossible && tameRoll > 0.6) {
        await addCompanionBeast(player, beast);
        tamed = true;
        console.log(`[explorar] ${player.name} domou ${beast.name} (roll=${tameRoll.toFixed(3)}).`);
        text += `\n🐾 Em vez de dar o golpe final, você estende seu sentido espiritual. ${beast.name} abaixa a cabeça: ele agora reconhece você como mestre.`;
      }

      const lootRoll = Math.random();
      if (lootRoll > 0.4) {
        const lootItems = await Item.find({ type: { $in: ['material', 'pill'] } });
        if (lootItems.length) {
          const found = randomOf(lootItems);
          player.inventory.push({ item: found._id, quantity: 1 });
          await player.save();
          console.log(`[explorar] Loot ${found.name} obtido por ${player.name} (roll=${lootRoll.toFixed(3)}).`);
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
      console.log('[explorar] Nenhum item definido no banco ao tentar explorar recursos genéricos.');
      return sock.sendMessage(from, { text: 'Você sente que a terra guarda segredos, mas ainda não há nada definido para encontrar aqui.' });
    }

    const found = randomOf(items);
    player.inventory.push({ item: found._id, quantity: 1 });
    await player.save();

    console.log(`[explorar] Jogador ${player.name} encontrou item genérico: ${found.name}.`);

    const text = `🌿 Vasculhando os arredores de ${region.name}, você encontra: ${found.name}.\nEle foi guardado com cuidado em seu inventário.`;

    await sock.sendMessage(from, { text });
  },
};
