const TALENTS = [
  // ── VULGAR (40%) ──────────────────────────────────────────────────
  { name: 'Corpo Resistente',       rarity: 'vulgar',        weight: 15, description: 'Corpo ligeiramente mais durável.', buffs: { endurance: 5 } },
  { name: 'Pés Velozes',            rarity: 'vulgar',        weight: 15, description: 'Movimento um pouco mais rápido.', buffs: { speed: 5 } },
  { name: 'Mão Firme',              rarity: 'vulgar',        weight: 10, description: 'Ataque físico levemente superior.', buffs: { attack: 3 } },

  // ── COMUM (30%) ───────────────────────────────────────────────────
  { name: 'Memória Aguçada',        rarity: 'common',        weight: 10, description: '+10% XP de técnicas.', buffs: { xpBonus: 0.10 } },
  { name: 'Olfato do Cultivador',   rarity: 'common',        weight: 8,  description: '+chance de achar ingredientes raros.', buffs: { herbLuck: 0.10 } },
  { name: 'Visão Noturna',          rarity: 'common',        weight: 7,  description: 'Explora melhor em regiões sombrias.', buffs: { darkPerception: 0.20 } },
  { name: 'Espírito Tranquilo',     rarity: 'common',        weight: 5,  description: '+5 Espírito base.', buffs: { spirit: 5 } },

  // ── INCOMUM (17%) ─────────────────────────────────────────────────
  { name: 'Afinidade Elemental',    rarity: 'uncommon',      weight: 6,  description: 'Compatível com mais elementos.', buffs: { elementAffinity: true } },
  { name: 'Metabolismo Acelerado',  rarity: 'uncommon',      weight: 5,  description: 'Cooldown de cultivo -20%.', buffs: { cultivateCd: -0.20 } },
  { name: 'Dom das Pílulas',        rarity: 'uncommon',      weight: 4,  description: '+20% eficiência de pílulas consumidas.', buffs: { pillEffect: 0.20 } },
  { name: 'Mente Analítica',        rarity: 'uncommon',      weight: 2,  description: '+15% XP do cultivo mental.', buffs: { mindXp: 0.15 } },

  // ── RARO (8%) ─────────────────────────────────────────────────────
  { name: 'Corpo de Ferro Menor',   rarity: 'rare',          weight: 3,  description: '+15% defesa física.', buffs: { defense: 0.15 } },
  { name: 'Raiz Dupla Fraca',       rarity: 'rare',          weight: 2,  description: 'Compatível com 2 elementos, velocidade levemente reduzida.', buffs: { dualRoot: true } },
  { name: 'Olho Divino (Menor)',    rarity: 'rare',          weight: 2,  description: 'Vê atributos de inimigos mais fracos.', buffs: { divine_eye_minor: true } },
  { name: 'Intelecto do Dao',       rarity: 'rare',          weight: 1,  description: '+10% chance de Epifania em cultivo.', buffs: { epiphany: 0.10 } },

  // ── ÉPICO — RAÍZES ESPIRITUAIS (3%) ───────────────────────────────
  { name: 'Raiz de Fogo Puro',      rarity: 'epic',          weight: 0.6, element: 'fire',    description: 'Técnicas de fogo +40% poder.', buffs: { firePower: 0.40 } },
  { name: 'Raiz do Trovão Celestial', rarity: 'epic',        weight: 0.5, element: 'thunder', description: 'Técnicas de trovão +40% poder.', buffs: { thunderPower: 0.40 } },
  { name: 'Raiz de Gelo Eterno',    rarity: 'epic',          weight: 0.5, element: 'ice',     description: 'Técnicas de gelo +40% poder.', buffs: { icePower: 0.40 } },
  { name: 'Raiz do Vazio',          rarity: 'epic',          weight: 0.3, element: 'void',    description: 'Reduz CD de habilidades do vazio, ignora barreiras.', buffs: { voidPower: 0.40 } },
  { name: 'Raiz da Terra Sagrada',  rarity: 'epic',          weight: 0.4, element: 'earth',   description: 'Defesa +40%, regeneração de HP.', buffs: { defense: 0.40 } },
  { name: 'Raiz do Vento Ancestral',rarity: 'epic',          weight: 0.4, element: 'wind',    description: 'Velocidade +40%, evasão máxima.', buffs: { speed: 0.40, evasion: 0.30 } },

  // ── LENDÁRIO — CORPOS ESPECIAIS (1.5%) ────────────────────────────
  { name: 'Corpo do Deus da Guerra',rarity: 'legendary',     weight: 0.5, description: 'Cada batalha vencida aumenta permanentemente ataque.', buffs: { combatGrowth: true } },
  { name: 'Corpo do Espelho',       rarity: 'legendary',     weight: 0.4, description: 'Reflete 15% do dano recebido.', buffs: { reflect: 0.15 } },
  { name: 'Corpo do Abismo',        rarity: 'legendary',     weight: 0.3, description: 'Absorve energia demoníaca como HP.', buffs: { demonicAbsorb: true } },
  { name: 'Corpo Venenoso',         rarity: 'legendary',     weight: 0.2, description: 'Imune a venenos, envenena inimigos ao contato.', buffs: { poisonBody: true } },
  { name: 'Corpo do Caos Menor',    rarity: 'legendary',     weight: 0.1, description: 'Atributos caóticos, potencial sem teto.', buffs: { chaosGrowth: true } },

  // ── MÍTICO — CORPOS DIVINOS (0.4%) ────────────────────────────────
  { name: 'Corpo do Imortal Eterno',rarity: 'mythic',        weight: 0.2, description: 'Regeneração passiva de HP/Qi, não envelhece.', buffs: { immortalRegen: true } },
  { name: 'Corpo do Dragão Sagrado',rarity: 'mythic',        weight: 0.15,description: 'Todos os atributos físicos +50%, aura intimidante.', buffs: { allPhysical: 0.50 } },
  { name: 'Corpo do Deus do Trovão',rarity: 'mythic',        weight: 0.05,description: 'Técnicas de trovão perfeitas, imune a trovão alheio.', buffs: { thunderPower: 0.80 } },

  // ── TRANSCENDENTE (0.1%) — 1 por servidor ─────────────────────────
  { name: 'Constituição do Caos Primordial', rarity: 'transcendent', weight: 0.07, serverUnique: true, description: 'Sem limitações, absorve qualquer técnica.', buffs: { infinite: true } },
  { name: 'Corpo do Espelho Celestial',      rarity: 'transcendent', weight: 0.03, serverUnique: true, description: 'Copia qualquer habilidade usada contra si uma vez.', buffs: { perfectMirror: true } },
];

function rollTalent() {
  const totalWeight = TALENTS.reduce((sum, t) => sum + t.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const talent of TALENTS) {
    roll -= talent.weight;
    if (roll <= 0) return talent;
  }
  return TALENTS[0];
}

// Rola 2 talentos únicos para o personagem
function rollTalents() {
  const first = rollTalent();
  let second;
  do { second = rollTalent(); } while (second.name === first.name);
  return [first, second];
}

module.exports = { TALENTS, rollTalent, rollTalents };
