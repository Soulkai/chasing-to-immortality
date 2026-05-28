const Region = require('../../models/Region');
const Player = require('../../models/Player');
const Item = require('../../models/Item');
const Beast = require('../../models/Beast');

function randomOf(array) {
  return array[Math.floor(Math.random() * array.length)];
}

module.exports = {
  name: 'coletar',
  aliases: ['coleta', 'gather'],
  async execute({ sock, from, sender }) {
    const phone = sender.split('@')[0];

    const player = await Player.findOne({ phone });
    if (!player) {
      return sock.sendMessage(from, { text: 'Você ainda não possui um personagem. Use !registrar para iniciar sua jornada.' });
    }

    if (player.isInClosedCultivation) {
      return sock.sendMessage(from, { text: 'Em cultivo recluso, até as ervas parecem meras ilusões. Termine o isolamento antes de coletar.' });
    }

    const region = await Region.findOne({ name: player.location });
    if (!region) {
      return sock.sendMessage(from, { text: 'As linhas do destino não reconhecem sua localização. Peça a um ancião (dev) para ajustar as regiões.' });
    }

    if (!region.resources || region.resources.length === 0) {
      return sock.sendMessage(from, { text: 'Este lugar parece estéril aos seus olhos. Talvez outras áreas escondam ervas e minérios mais generosos.' });
    }

    const hasSickle = player.inventory?.some(entry => entry.item && String(entry.item.name || entry.item) === 'Foice de Coleta Simples');
    const hasPickaxe = player.inventory?.some(entry => entry.item && String(entry.item.name || entry.item) === 'Picareta de Minério Bruto');

    const difficulty = region.dangerLevel || 1;
    const baseSuccess = 0.7 - difficulty * 0.05; // áreas perigosas dificultam coleta

    let effectiveSuccess = baseSuccess;
    let missingTools = [];

    // Heurística simples: se o recurso tiver "Erva" no nome, requer foice; se tiver "Minério", requer picareta.
    const resourceItems = await Item.find({ _id: { $in: region.resources } });
    if (!resourceItems.length) {
      return sock.sendMessage(from, { text: 'Você sente que a terra guarda algo, mas ainda não há recursos definidos para esta região.' });
    }

    const target = randomOf(resourceItems);

    if (/Erva/i.test(target.name) && !hasSickle) {
      effectiveSuccess -= 0.4;
      missingTools.push('foice de coleta');
    }
    if (/Minério/i.test(target.name) && !hasPickaxe) {
      effectiveSuccess -= 0.4;
      missingTools.push('picareta');
    }

    if (effectiveSuccess < 0.05) effectiveSuccess = 0.05;

    const roll = Math.random();

    if (roll > effectiveSuccess) {
      let text = `🌾 Você passa um bom tempo vasculhando ${region.name}, mas volta de mãos vazias.`;

      if (missingTools.length) {
        text += `\nPior ainda, sem ${missingTools.join(' e ')}, você sente que só está perdendo tempo aqui.`;
      }

      // Punitivo: chance de atrair besta extra em áreas perigosas ao falhar
      const attractRoll = Math.random();
      if (difficulty >= 4 && attractRoll > 0.6 && region.beasts?.length) {
        const beastId = randomOf(region.beasts);
        const beast = await Beast.findById(beastId);
        if (beast) {
          text += `\n🩸 Enquanto faz barulho entre as pedras e folhas, você sente olhos famintos te observando. ${beast.name} começou a te perseguir — tome cuidado ao explorar novamente.`;
        }
      }

      return sock.sendMessage(from, { text });
    }

    // Sucesso: guarda o recurso
    player.inventory.push({ item: target._id, quantity: 1 });
    await player.save();

    let text = `🌿 Em meio a ${region.name}, você encontra ${target.name} e o guarda com cuidado em sua bolsa.`;

    if (missingTools.length) {
      text += `\nAinda assim, você sente que com ${missingTools.join(' e ')} adequados poderia colher muito mais.`;
    }

    await sock.sendMessage(from, { text });
  },
};
