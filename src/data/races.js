// Dados estáticos de raças com probabilidades
const RACES = [
  // ── MORTAIS (60%) ──────────────────────────────────────────────────
  { name: 'Humano Comum',            category: 'mortal',   weight: 25, buffs: { luck: 2 }, description: 'Base do mundo, potencial em treinamento.' },
  { name: 'Humano Nômade',           category: 'mortal',   weight: 15, buffs: { luck: 5 }, description: 'Vida errante, sorte aguçada.' },
  { name: 'Humano Nobre',            category: 'mortal',   weight: 12, buffs: { karma: 10, charisma: 5 }, description: 'Sangue cultivador distante.' },
  { name: 'Meio-Sangue Cultivador',  category: 'mortal',   weight: 8,  buffs: { strength: 2, spirit: 2, agility: 2 }, description: 'Antepassado cultivador, potencial equilibrado.' },

  // ── SANGUE DESPERTO (25%) ──────────────────────────────────────────
  { name: 'Semi-Bestial (Tigre)',    category: 'awakened', weight: 8,  buffs: { strength: 8, agility: 5 }, description: 'Sangue de besta antiga — força bruta.' },
  { name: 'Semi-Bestial (Raposa)',   category: 'awakened', weight: 7,  buffs: { spirit: 8, charisma: 10 }, description: 'Nove Caudas diluído — espírito e charme.' },
  { name: 'Semi-Demoníaco',          category: 'awakened', weight: 5,  buffs: { endurance: 8, perception: 5 }, description: 'Linhagem menor de demônio.' },
  { name: 'Sangue de Fênix Diluído', category: 'awakened', weight: 3,  buffs: { spirit: 5, willpower: 5 }, description: 'Regeneração lenta, ancestral fênix.' },
  { name: 'Semi-Celestial',          category: 'awakened', weight: 2,  buffs: { spirit: 8, perception: 5 }, description: 'Descendente menor celestial.' },

  // ── SANGUE ANTIGO (10%) ────────────────────────────────────────────
  { name: 'Dragão Menor',            category: 'ancient',  weight: 3,  buffs: { strength: 12, endurance: 10 }, description: 'Linhagem dracônica menor.' },
  { name: 'Demoníaco Puro',          category: 'ancient',  weight: 2,  buffs: { attack: 15, karma: -20 }, description: 'Linhagem demoníaca real.' },
  { name: 'Celestial Menor',         category: 'ancient',  weight: 2,  buffs: { spirit: 15, perception: 8 }, description: 'Descendente de imortais.' },
  { name: 'Bestial Ancestral',       category: 'ancient',  weight: 2,  buffs: { strength: 10, agility: 10, endurance: 10 }, description: 'Besta antiga da 4ª era.' },
  { name: 'Espectral',               category: 'ancient',  weight: 1,  buffs: { spirit: 12, agility: 8 }, description: 'Ser entre vivos e mortos.' },

  // ── SANGUE DIVINO (4%) ─────────────────────────────────────────────
  { name: 'Dragão Verdadeiro',       category: 'divine',   weight: 1.5, buffs: { strength: 20, spirit: 10, agility: 10 }, description: 'Sangue dracônico puro.' },
  { name: 'Fênix Renascida',         category: 'divine',   weight: 1.0, buffs: { spirit: 20, willpower: 15 }, special: 'revive', description: 'Revive 1x por morte com 50% HP.' },
  { name: 'Espírito Celestial',      category: 'divine',   weight: 0.8, buffs: { spirit: 25 }, description: 'Ser nascido dos céus.' },
  { name: 'Demônio Primordial',      category: 'divine',   weight: 0.5, buffs: { attack: 25, karma: -50 }, description: 'Um dos primeiros demônios.' },
  { name: 'Qilin',                   category: 'divine',   weight: 0.2, buffs: { luck: 30, karma: 50 }, description: 'Ser sagrado lendário.' },

  // ── CORPO DO CAOS / LINHAGENS PROIBIDAS (1%) ──────────────────────
  { name: 'Filho do Caos',           category: 'chaos',    weight: 0.4, buffs: {}, special: 'chaos_attrs', description: 'Atributos aleatórios a cada reino.' },
  { name: 'Deus Decaído',            category: 'chaos',    weight: 0.3, buffs: { spirit: 15 }, special: 'epiphany_boost', description: 'Imortal reencarnado, epifanias constantes.' },
  { name: 'Void Walker',             category: 'chaos',    weight: 0.2, buffs: { agility: 20, perception: 15 }, description: 'Ignora 10% de defesa inimiga.' },
  { name: 'Imortal Reencarnado',     category: 'chaos',    weight: 0.1, buffs: { spirit: 20, willpower: 20 }, special: 'inherit_technique', description: 'Herda fragmentos de técnica.' },
];

function rollRace() {
  const totalWeight = RACES.reduce((sum, r) => sum + r.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const race of RACES) {
    roll -= race.weight;
    if (roll <= 0) return race;
  }
  return RACES[0];
}

module.exports = { RACES, rollRace };
