const Technique = require('../models/Technique');
const Item = require('../models/Item');
const Region = require('../models/Region');
const Sect = require('../models/Sect');
const NPC = require('../models/NPC');
const Beast = require('../models/Beast');

async function seedWorld() {
  // Clear minimal world collections (optional: comment out in production)
  // await Promise.all([
  //   Technique.deleteMany({}),
  //   Item.deleteMany({}),
  //   Region.deleteMany({}),
  //   Sect.deleteMany({}),
  //   NPC.deleteMany({}),
  //   Beast.deleteMany({}),
  // ]);

  // ── Seitas ────────────────────────────────────────────────────────────────
  const orthodoxSect = await Sect.findOneAndUpdate(
    { name: 'Pavilhão da Luz Serena' },
    {
      name: 'Pavilhão da Luz Serena',
      description: 'Uma seita ortodoxa que busca harmonizar o Dao com compaixão e disciplina. Seus discípulos treinam sob cascatas serenas e bosques de bambu.',
      philosophy: 'Cultivar sem esquecer o mundo mortal, proteger os fracos e refinar o coração.',
      alignment: 'orthodox',
    },
    { upsert: true, new: true }
  );

  const demonicSect = await Sect.findOneAndUpdate(
    { name: 'Culto do Abismo Carmesim' },
    {
      name: 'Culto do Abismo Carmesim',
      description: 'Uma organização demoníaca que acredita que apenas ao desafiar os céus com ferocidade se alcança a verdadeira imortalidade.',
      philosophy: 'A misericórdia é luxo de fracos; apenas o sangue alimenta o Dao.',
      alignment: 'demonic',
    },
    { upsert: true, new: true }
  );

  // ── Técnicas Iniciais ────────────────────────────────────────────────────
  const techniquesData = [
    {
      name: 'Respiração da Bruma Serena',
      description: 'Uma técnica ortodoxa de cultivo de Qi que guia a respiração de forma suave, como névoa sobre um lago ao amanhecer.',
      rarity: 'common',
      cultivationType: 'qi',
      paths: ['qi'],
      element: 'water',
      grade: 1,
      baseXpBonus: 1.0,
      breakthroughBonus: 0,
      clanAffinity: 'Clã da Bruma Serena',
    },
    {
      name: 'Forja dos Ossos de Jade',
      description: 'Uma técnica de cultivo corporal que refina ossos e músculos até a dureza da jade fria.',
      rarity: 'uncommon',
      cultivationType: 'body',
      paths: ['body'],
      element: 'earth',
      grade: 1,
      baseXpBonus: 1.0,
      breakthroughBonus: 0,
      clanAffinity: 'Clã da Lança de Pedra',
    },
    {
      name: 'Coração Espehado do Dao',
      description: 'Uma técnica mental que reflete desejos e ilusões, ajudando o cultivador a estabilizar sua mente diante de tribulações.',
      rarity: 'uncommon',
      cultivationType: 'mind',
      paths: ['mind'],
      element: 'none',
      grade: 1,
      baseXpBonus: 1.0,
      breakthroughBonus: 0,
      clanAffinity: 'Clã da Pluma Celeste',
    },
    {
      name: 'Caminho da Lâmina Carmesim',
      description: 'Técnica de Qi e combate que condensa Qi sanguíneo em lâminas carmesim. Poderosa, porém marcada por um leve cheiro de ferocidade.',
      rarity: 'rare',
      cultivationType: 'combat',
      paths: ['qi'],
      element: 'fire',
      grade: 2,
      baseXpBonus: 1.2,
      breakthroughBonus: 1,
      clanAffinity: 'Clã do Sabre Carmesim',
    },
    {
      name: 'Canção dos Meridianos Caóticos',
      description: 'Uma técnica demoníaca que força o Qi a correr por meridianos não convencionais. Oferece rápido progresso, mas flerta com desvios de cultivo.',
      rarity: 'epic',
      cultivationType: 'multi',
      paths: ['qi','body'],
      element: 'yin',
      grade: 3,
      baseXpBonus: 1.6,
      breakthroughBonus: 3,
      clanAffinity: 'Culto do Abismo Carmesim',
    },
  ];

  const techniques = [];
  for (const data of techniquesData) {
    const t = await Technique.findOneAndUpdate(
      { name: data.name },
      data,
      { upsert: true, new: true }
    );
    techniques.push(t);
  }

  // ── Itens básicos, comida e ferramentas ───────────────────────────────────
  const itemsData = [
    {
      name: 'Túnica de Discípulo da Aldeia',
      description: 'Uma túnica simples usada por iniciantes da Aldeia do Início.',
      rarity: 'common',
      type: 'equipment',
      slot: 'body',
      stats: { hp: 10, defense: 2 },
    },
    {
      name: 'Espada de Ferro Simples',
      description: 'Uma lâmina de ferro sem refinamento espiritual, mas confiável.',
      rarity: 'common',
      type: 'equipment',
      slot: 'weapon',
      stats: { attack: 5 },
    },
    {
      name: 'Pão de Grãos Espirituais',
      description: 'Um pão feito com grãos levemente espirituais, sacia a fome de um dia de treino.',
      rarity: 'common',
      type: 'consumable',
      isFood: true,
      stats: {},
    },
    {
      name: 'Água de Fonte Serena',
      description: 'Água fresca de uma nascente próxima à Aldeia do Início.',
      rarity: 'common',
      type: 'consumable',
      isFood: true,
      stats: {},
    },
    {
      name: 'Foice de Coleta Simples',
      description: 'Ferramenta usada para colher ervas e grãos.',
      rarity: 'common',
      type: 'tool',
      slot: null,
      stats: {},
    },
    {
      name: 'Picareta de Minério Bruto',
      description: 'Ferramenta usada para extrair minérios de baixa qualidade.',
      rarity: 'common',
      type: 'tool',
      slot: null,
      stats: {},
    },
    {
      name: 'Erva da Bruma Suave',
      description: 'Uma erva comum que cresce em áreas úmidas. Base para pílulas de recuperação simples.',
      rarity: 'common',
      type: 'material',
      stats: {},
    },
    {
      name: 'Pílula de Recuperação Leve',
      description: 'Restaura um pouco de HP e Qi, com quase nenhum efeito colateral.',
      rarity: 'common',
      type: 'pill',
      stats: {},
    },
  ];

  const items = [];
  for (const data of itemsData) {
    const i = await Item.findOneAndUpdate(
      { name: data.name },
      data,
      { upsert: true, new: true }
    );
    items.push(i);
  }

  const bread = items.find(i => i.name === 'Pão de Grãos Espirituais');
  const water = items.find(i => i.name === 'Água de Fonte Serena');
  const tunic = items.find(i => i.name === 'Túnica de Discípulo da Aldeia');
  const sword = items.find(i => i.name === 'Espada de Ferro Simples');

  // ── Bestas iniciais ──────────────────────────────────────────────────────
  const beastsData = [
    {
      name: 'Coelho de Grama Espiritual',
      description: 'Uma pequena besta com traços espirituais, geralmente dócil.',
      rarity: 'common',
      element: 'wood',
      baseStats: { hp: 40, attack: 4, defense: 2, speed: 10 },
      tamable: true,
    },
    {
      name: 'Lobo da Floresta Nebulosa',
      description: 'Um lobo que caça sob a cobertura da névoa, suas presas raramente o veem chegando.',
      rarity: 'uncommon',
      element: 'wind',
      baseStats: { hp: 80, attack: 10, defense: 4, speed: 12 },
      tamable: true,
    },
  ];

  const beasts = [];
  for (const data of beastsData) {
    const b = await Beast.findOneAndUpdate(
      { name: data.name },
      data,
      { upsert: true, new: true }
    );
    beasts.push(b);
  }

  // ── Regiões iniciais ─────────────────────────────────────────────────────
  const villageRegion = await Region.findOneAndUpdate(
    { name: 'Terras do Início' },
    {
      name: 'Terras do Início',
      description: 'Campos tranquilos, pequenas florestas e colinas suaves, onde a maioria dos mortais vive sem nunca ver um cultivador de alto reino.',
      dangerLevel: 1,
      minRealmQi: 0,
      maxRealmQi: 1,
      resources: items.filter(i => ['Erva da Bruma Suave', 'Pão de Grãos Espirituais', 'Água de Fonte Serena'].includes(i.name)).map(i => i._id),
      beasts: beasts.filter(b => b.name === 'Coelho de Grama Espiritual').map(b => b._id),
      cultivationBonus: {
        qiXpMultiplier: 1.0,
        bodyXpMultiplier: 1.0,
        mindXpMultiplier: 1.0,
        epiphanyChanceBonus: 0,
      },
    },
    { upsert: true, new: true }
  );

  await Region.findOneAndUpdate(
    { name: 'Floresta Nebulosa' },
    {
      name: 'Floresta Nebulosa',
      description: 'Uma floresta coberta por névoa densa. O Qi espiritual é mais ativo aqui, mas bestas perigosas rondam nas sombras.',
      dangerLevel: 3,
      minRealmQi: 1,
      maxRealmQi: 3,
      resources: items.filter(i => ['Erva da Bruma Suave'].includes(i.name)).map(i => i._id),
      beasts: beasts.map(b => b._id),
      cultivationBonus: {
        qiXpMultiplier: 1.2,
        bodyXpMultiplier: 1.0,
        mindXpMultiplier: 1.0,
        epiphanyChanceBonus: 1,
      },
    },
    { upsert: true, new: true }
  );

  // Ligar seitas a região inicial (pode ser ajustado depois)
  orthodoxSect.region = villageRegion._id;
  await orthodoxSect.save();

  // ── NPCs iniciais ────────────────────────────────────────────────────────
  const npcsData = [
    {
      name: 'Ancião Mu',
      role: 'master',
      sect: orthodoxSect._id,
      region: villageRegion._id,
      minKarma: 0,
      maxKarma: 100,
      personality: 'Calmo, paciente e observador. Acredita que até o menor mortal pode ascender se não desviar do coração.',
      affinityElement: 'wood',
      initialOpinion: 10,
    },
    {
      name: 'Discípulo Lin Fei',
      role: 'rival',
      sect: orthodoxSect._id,
      region: villageRegion._id,
      minKarma: -20,
      maxKarma: 60,
      personality: 'Orgulhoso e competitivo, respeita apenas aqueles que provam seu valor.',
      affinityElement: 'wind',
      initialOpinion: -5,
    },
    {
      name: 'Vendedora Yun',
      role: 'merchant',
      sect: null,
      region: villageRegion._id,
      minKarma: -100,
      maxKarma: 100,
      personality: 'Pragmática. Karma não paga contas, mas arruaça na aldeia atrai problemas.',
      affinityElement: 'none',
      initialOpinion: 0,
    },
  ];

  for (const data of npcsData) {
    await NPC.findOneAndUpdate(
      { name: data.name },
      data,
      { upsert: true, new: true }
    );
  }

  return {
    techniques,
    items,
    villageRegion,
    orthodoxSect,
  };
}

module.exports = { seedWorld };
