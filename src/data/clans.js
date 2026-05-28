const CLANS = [
  // ── ESPADA & COMBATE ──────────────────────────────────────────────
  { name: 'Clã Namgong',   kanji: '南宮', weight: 6,  specialty: 'sword',    buffs: { xpBonus: 0.25 },           description: 'Linhagem nobre, mestres da espada sagrada.' },
  { name: 'Clã Murong',    kanji: '慕容', weight: 5,  specialty: 'counter',  buffs: { counterAttack: 0.20 },     description: 'Mimetismo de técnicas alheias.' },
  { name: 'Clã Xiahou',    kanji: '夏侯', weight: 5,  specialty: 'brute',    buffs: { strength: 10, agility: 5 },description: 'Guerreiros brutais de espada.' },
  { name: 'Clã Tang',      kanji: '唐',   weight: 4,  specialty: 'hidden',   buffs: { poison: 0.30 },            description: 'Mestres de armas ocultas e venenos.' },
  { name: 'Clã Dugu',      kanji: '獨孤', weight: 3,  specialty: 'solo',     buffs: { soloDmg: 0.30 },           description: 'Espada solitária — bônus sem grupo.' },

  // ── QI ESPIRITUAL ─────────────────────────────────────────────────
  { name: 'Clã Ye',        kanji: '葉',   weight: 6,  specialty: 'qi',       buffs: { qiSpeed: 0.20 },           description: 'Cultivadores de Qi puro.' },
  { name: 'Clã Yufei',     kanji: '玉菲', weight: 5,  specialty: 'spirit',   buffs: { spirit: 12, charisma: 8 }, description: 'Qi feminino sagrado, espírito elevado.' },
  { name: 'Clã Xiao',      kanji: '蕭',   weight: 6,  specialty: 'balanced', buffs: { allStats: 0.15 },          description: 'Linhagem antiga e versátil.' },
  { name: 'Clã Chu',       kanji: '楚',   weight: 4,  specialty: 'resist',   buffs: { spiritResist: 0.30 },      description: 'Resistência a técnicas espirituais.' },
  { name: 'Clã Liu',       kanji: '劉',   weight: 5,  specialty: 'insight',  buffs: { epiphany: 0.20 },          description: 'Insight místico, epifanias frequentes.' },

  // ── ALQUIMIA & ERVAS ──────────────────────────────────────────────
  { name: 'Clã Dan',       kanji: '丹',   weight: 4,  specialty: 'alchemy',  buffs: { pillEffect: 0.40 },        description: 'Linhagem dos alquimistas sagrados.' },
  { name: 'Clã Yao',       kanji: '藥',   weight: 4,  specialty: 'herb',     buffs: { herbIdentify: 0.30 },      description: 'Mestres de ervas medicinais.' },
  { name: 'Clã Hua',       kanji: '華',   weight: 3,  specialty: 'garden',   buffs: { herbLuck: 0.20 },          description: 'Cultivadores de jardins sagrados.' },

  // ── ELEMENTAIS ────────────────────────────────────────────────────
  { name: 'Clã Yan',       kanji: '炎',   weight: 4,  specialty: 'fire',     buffs: { firePower: 0.30, icePenalty: -0.20 }, description: 'Linhagem de chamas.' },
  { name: 'Clã Bing',      kanji: '冰',   weight: 4,  specialty: 'ice',      buffs: { icePower: 0.30, firePenalty: -0.20 }, description: 'Linhagem de gelo eterno.' },
  { name: 'Clã Lei',       kanji: '雷',   weight: 4,  specialty: 'thunder',  buffs: { thunderPower: 0.30, speed: 10 }, description: 'Linhagem do trovão.' },
  { name: 'Clã Feng',      kanji: '風',   weight: 4,  specialty: 'wind',     buffs: { speed: 15, evasion: 0.10 }, description: 'Linhagem do vento.' },
  { name: 'Clã Tu',        kanji: '土',   weight: 4,  specialty: 'earth',    buffs: { defense: 15, speedPenalty: -0.10 }, description: 'Linhagem da terra e montanhas.' },

  // ── SOMBRAS & CAOS ────────────────────────────────────────────────
  { name: 'Clã Mo',        kanji: '魔',   weight: 3,  specialty: 'demonic',  buffs: { demonicPower: 0.35, karma: -30 }, description: 'Cultivadores do caminho demoníaco.' },
  { name: 'Clã Gui',       kanji: '鬼',   weight: 2,  specialty: 'ghost',    buffs: { stealth: 0.30, poison: 0.20 }, description: 'Assassinos fantasmas.' },
  { name: 'Clã Sha',       kanji: '殺',   weight: 2,  specialty: 'kill',     buffs: { critDmg: 0.40, karma: -10 }, description: 'Linhagem dos assassinos.' },

  // ── RAROS ─────────────────────────────────────────────────────────
  { name: 'Clã Long',      kanji: '龍',   weight: 1,  specialty: 'dragon',   buffs: { allStats: 0.30 },           description: 'Descendentes de dragão.' },
  { name: 'Clã Huang',     kanji: '皇',   weight: 1,  specialty: 'imperial', buffs: { karma: 50, charisma: 20 },  description: 'Linhagem imperial antiga.' },
  { name: 'Clã Tian',      kanji: '天',   weight: 0.5,specialty: 'celestial',buffs: { spirit: 25 },               description: 'Celestiais reencarnados.' },
  { name: 'Sem Clã',       kanji: '—',    weight: 10, specialty: 'free',     buffs: { luck: 20 },                 description: 'Andarilhos, sem restrição de técnica.' },
];

function rollClan() {
  const totalWeight = CLANS.reduce((sum, c) => sum + c.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const clan of CLANS) {
    roll -= clan.weight;
    if (roll <= 0) return clan;
  }
  return CLANS.find(c => c.name === 'Sem Clã');
}

module.exports = { CLANS, rollClan };
