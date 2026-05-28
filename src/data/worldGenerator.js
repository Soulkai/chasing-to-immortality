const mongoose = require('mongoose');
const Region = require('../models/Region');
const Beast = require('../models/Beast');

// Helper para criar peso/probabilidade simples
function weightedChoice(choices) {
  const total = choices.reduce((sum, c) => sum + c.weight, 0);
  let r = Math.random() * total;
  for (const c of choices) {
    if (r < c.weight) return c.value;
    r -= c.weight;
  }
  return choices[choices.length - 1].value;
}

// Geração de nomes simples para mundos/impérios/reinos/cidades
function makeWorldName(idx) {
  const base = ['Mundo do Orvalho Mortal', 'Mundo do Céu Pálido', 'Mundo do Abismo Silencioso'];
  return base[idx] || `Mundo Desconhecido ${idx + 1}`;
}

function makeEmpireName(worldIndex, empireIndex) {
  const titles = ['Império da Lua', 'Império do Dragão', 'Império das Mil Espadas', 'Império do Jade Eterno', 'Império do Trovão'];
  const prefix = ['Setentrional', 'Meridional', 'Oriental', 'Ocidental', 'Central'];
  const t = titles[empireIndex % titles.length];
  const p = prefix[(worldIndex + empireIndex) % prefix.length];
  return `${t} ${p}`;
}

function makeKingdomName(worldIndex, empireIndex, kingdomIndex) {
  const cores = ['Cinzas', 'Vermelho', 'Azul', 'Verde', 'Negro'];
  const elementos = ['Chama', 'Bruma', 'Rochedo', 'Névoa', 'Vento'];
  const c = cores[(worldIndex + empireIndex + kingdomIndex) % cores.length];
  const e = elementos[(worldIndex * 3 + empireIndex + kingdomIndex) % elementos.length];
  return `Reino da ${e} ${c}`;
}

function makeCityName(worldIndex, empireIndex, kingdomIndex, cityIndex) {
  const tipos = ['Cidade', 'Fortaleza', 'Posto Fronteiriço', 'Vila', 'Porto'];
  const qualidades = ['Calma', 'Sanguinária', 'Próspera', 'Sombria', 'Esquecida'];
  const t = tipos[(cityIndex + kingdomIndex) % tipos.length];
  const q = qualidades[(worldIndex + empireIndex + cityIndex) % qualidades.length];
  return `${t} ${q}`;
}

// Classificação de dificuldade simples
function getDifficulty(worldIndex, empireIndex, kingdomIndex, cityIndex) {
  // Mundo 0: início / Mundo 1: intermediário / Mundo 2: avançado
  let base = worldIndex * 3 + 1; // 1, 4, 7
  base += Math.floor(empireIndex / 2); // imperios mais "distantes" um pouco mais difíceis
  base += Math.floor(kingdomIndex / 5); // reinos mais fundos mais difíceis
  base += Math.floor(cityIndex / 10); // cidades mais profundas mais difíceis
  if (base < 1) base = 1;
  if (base > 10) base = 10;
  return base;
}

// Pequeno bestiário base
const BASE_BEASTS = [
  {
    name: 'Coelho de Grama Espiritual',
    description: 'Uma pequena besta com traços espirituais, geralmente dócil.',
    rarity: 'common',
    element: 'wood',
    baseStats: { hp: 40, attack: 4, defense: 2, speed: 10 },
    tamable: true,
    minDifficulty: 1,
    maxDifficulty: 3,
  },
  {
    name: 'Javali de Pedra',
    description: 'Um javali de pele dura como rocha, famoso por investir em cultivadores desavisados.',
    rarity: 'common',
    element: 'earth',
    baseStats: { hp: 70, attack: 7, defense: 6, speed: 6 },
    tamable: true,
    minDifficulty: 2,
    maxDifficulty: 5,
  },
  {
    name: 'Serpente de Névoa',
    description: 'Uma serpente que se esconde em neblinas densas, aplicando veneno e ataques furtivos.',
    rarity: 'uncommon',
    element: 'water',
    baseStats: { hp: 60, attack: 9, defense: 4, speed: 11 },
    tamable: true,
    minDifficulty: 3,
    maxDifficulty: 7,
  },
  {
    name: 'Corvo de Olhos Carmesins',
    description: 'Ave com olhos vermelhos que pressagia calamidades. Às vezes ataca em bandos.',
    rarity: 'uncommon',
    element: 'wind',
    baseStats: { hp: 45, attack: 8, defense: 3, speed: 13 },
    tamable: true,
    minDifficulty: 3,
    maxDifficulty: 8,
  },
  {
    name: 'Tigre de Dentes de Jade',
    description: 'Um predador feroz cujos dentes podem atravessar armaduras comuns.',
    rarity: 'rare',
    element: 'metal',
    baseStats: { hp: 120, attack: 18, defense: 9, speed: 10 },
    tamable: true,
    minDifficulty: 5,
    maxDifficulty: 9,
  },
  {
    name: 'Quimera da Chama Sombria',
    description: 'Uma besta composta de múltiplas formas, cuja chama negra corrói o próprio Qi.',
    rarity: 'epic',
    element: 'fire',
    baseStats: { hp: 200, attack: 30, defense: 16, speed: 9 },
    tamable: false,
    minDifficulty: 8,
    maxDifficulty: 10,
  },
];

async function ensureBaseBeasts() {
  const beastDocs = [];
  for (const data of BASE_BEASTS) {
    const doc = await Beast.findOneAndUpdate(
      { name: data.name },
      data,
      { upsert: true, new: true }
    );
    beastDocs.push(doc);
  }
  return beastDocs;
}

async function generateWorlds() {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const beasts = await ensureBaseBeasts();

    const worlds = 3;
    const empiresPerWorld = 5;
    const kingdomsPerEmpire = 5;
    const citiesPerKingdom = 5;

    for (let w = 0; w < worlds; w++) {
      const worldName = makeWorldName(w);

      for (let e = 0; e < empiresPerWorld; e++) {
        const empireName = makeEmpireName(w, e);

        for (let k = 0; k < kingdomsPerEmpire; k++) {
          const kingdomName = makeKingdomName(w, e, k);

          for (let c = 0; c < citiesPerKingdom; c++) {
            const cityName = makeCityName(w, e, k, c);
            const difficulty = getDifficulty(w, e, k, c); // 1–10

            const qiMin = Math.max(0, Math.floor((difficulty - 1) / 2));
            const qiMax = qiMin + 2;

            const beastsHere = beasts.filter(
              b => difficulty >= b.minDifficulty && difficulty <= b.maxDifficulty
            );

            await Region.findOneAndUpdate(
              {
                name: cityName,
                worldIndex: w,
                empireIndex: e,
                kingdomIndex: k,
                cityIndex: c,
              },
              {
                name: cityName,
                worldName,
                empireName,
                kingdomName,
                worldIndex: w,
                empireIndex: e,
                kingdomIndex: k,
                cityIndex: c,
                description: `${cityName} localizada em ${kingdomName}, parte do ${empireName} no ${worldName}.`,
                dangerLevel: difficulty,
                minRealmQi: qiMin,
                maxRealmQi: qiMax,
                beasts: beastsHere.map(b => b._id),
                resources: [],
                cultivationBonus: {
                  qiXpMultiplier: 1 + (difficulty - 1) * 0.05,
                  bodyXpMultiplier: 1,
                  mindXpMultiplier: 1,
                  epiphanyChanceBonus: difficulty >= 6 ? 1 : 0,
                },
              },
              { upsert: true, new: true, session }
            );
          }
        }
      }
    }

    await session.commitTransaction();
    session.endSession();

    return { success: true };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

module.exports = { generateWorlds };
