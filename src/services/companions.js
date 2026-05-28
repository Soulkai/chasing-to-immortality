const Player = require('../models/Player');
const Beast = require('../models/Beast');

// Middleware simples opcional que você pode acoplar no schema de Player,
// mas aqui deixamos como helpers utilitários para domar/gerenciar companheiros.

async function addCompanionBeast(player, beastDoc) {
  if (!player.companions) player.companions = [];

  // Evita duplicar exatamente a mesma instância se quiser limitar
  const already = player.companions.find(c => String(c.beast) === String(beastDoc._id));
  if (already) {
    already.bond = Math.min(100, (already.bond || 0) + 5);
  } else {
    player.companions.push({
      beast: beastDoc._id,
      name: beastDoc.name,
      role: 'combat', // combat | mount | utility
      bond: 10,
      isActive: false,
    });
  }

  await player.save();
  return player;
}

async function setActiveCompanion(player, beastIdOrName) {
  if (!player.companions || player.companions.length === 0) return null;

  let targetIndex = player.companions.findIndex(
    c => String(c.beast) === String(beastIdOrName) || c.name.toLowerCase() === String(beastIdOrName).toLowerCase()
  );

  if (targetIndex === -1) return null;

  player.companions.forEach((c, idx) => {
    c.isActive = idx === targetIndex;
  });

  await player.save();
  return player.companions[targetIndex];
}

async function computeCompanionBonus(player) {
  if (!player.companions) return { attack: 0, defense: 0, speed: 0, carry: 0 };

  const active = player.companions.find(c => c.isActive);
  if (!active) return { attack: 0, defense: 0, speed: 0, carry: 0 };

  const beast = await Beast.findById(active.beast);
  if (!beast) return { attack: 0, defense: 0, speed: 0, carry: 0 };

  const bondFactor = (active.bond || 0) / 100;

  // Bônus simples: fração dos stats da besta escalado pelo vínculo
  return {
    attack: Math.round((beast.baseStats.attack || 0) * 0.3 * (0.5 + bondFactor)),
    defense: Math.round((beast.baseStats.defense || 0) * 0.3 * (0.5 + bondFactor)),
    speed: Math.round((beast.baseStats.speed || 0) * 0.2 * (0.5 + bondFactor)),
    carry: Math.round((beast.baseStats.hp || 0) * 0.1 * (0.5 + bondFactor)),
  };
}

module.exports = {
  addCompanionBeast,
  setActiveCompanion,
  computeCompanionBonus,
};
