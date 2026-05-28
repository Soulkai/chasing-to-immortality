// Seitas pré-existentes no mundo (controladas pelo bot como NPCs)
const PREBUILT_SECTS = [
  // ── ORTODOXAS ──────────────────────────────────────────────────────
  {
    name: 'Seita do Pico Celeste',
    kanji: '天峰宗',
    alignment: 'orthodox',
    specialty: 'sword_qi',
    description: 'A mais famosa seita de espada celestial. Técnicas de Qi puro inigualáveis.',
    minRealm: 2, // Formação do Núcleo
    location: 'Pico das Nuvens Eternas',
    bonuses: { qiSpeed: 0.20, swordDmg: 0.25 },
    techniques: ['Espada do Qi Celestial', 'Forma dos Dez Mil Cortes', 'Domínio do Pico'],
    lore: 'Fundada há 10.000 anos pelo Imortal Espada Tian Feng, que ascendeu cortando a própria tribulação.'
  },
  {
    name: 'Seita da Nuvem Branca',
    kanji: '白雲門',
    alignment: 'orthodox',
    specialty: 'alchemy_healing',
    description: 'Mestres de alquimia e cura. Fornecem pílulas sagradas ao mundo.',
    minRealm: 1, // Fundação Completa
    location: 'Vale das Ervas Celestiais',
    bonuses: { pillEffect: 0.30, alchemySpeed: 0.25 },
    techniques: ['Arte da Pílula Sagrada', 'Qi de Cura', 'Jardim Celestial'],
    lore: 'Seu fundador descobriu a Pílula da Longevidade Eterna, tornando-se o maior alquimista da era.'
  },
  {
    name: 'Seita do Lótus Sagrado',
    kanji: '聖蓮派',
    alignment: 'orthodox',
    specialty: 'spirit_meditation',
    description: 'Cultivo do Espírito ao nível máximo. Epifanias frequentes e visão do Dao.',
    minRealm: 1,
    location: 'Lago do Lótus Eterno',
    bonuses: { spiritXp: 0.30, epiphany: 0.20 },
    techniques: ['Meditação do Lótus', 'Visão do Dao', 'Mente do Espelho'],
    lore: 'Seus monges meditam por séculos em silêncio absoluto até tocar o Dao.'
  },
  {
    name: 'Seita da Montanha de Jade',
    kanji: '玉山宗',
    alignment: 'orthodox',
    specialty: 'forging',
    description: 'Mestres de forja divina. Criam as armas mais poderosas do mundo mortal.',
    minRealm: 2,
    location: 'Montanha de Jade Eterna',
    bonuses: { forgeBonus: 0.40, weaponDmg: 0.20 },
    techniques: ['Arte da Forja Celestial', 'Toque do Ferreiro Divino', 'Runa Ancestral'],
    lore: 'A Espada do Trovão Celestial foi forjada aqui. Dizem que a fornalha ainda queima com fogo divino.'
  },
  {
    name: 'Seita dos Cinco Elementos',
    kanji: '五行宗',
    alignment: 'orthodox',
    specialty: 'elemental',
    description: 'Domínio equilibrado dos cinco elementos. Versáteis e poderosos.',
    minRealm: 1,
    location: 'Jardim dos Cinco Picos',
    bonuses: { allElements: 0.20 },
    techniques: ['Fist dos Cinco Elementos', 'Rotação do Ciclo', 'Barreira Elemental'],
    lore: 'Fundada por cinco irmãos, cada um mestre de um elemento. Suas almas fusionadas guardam o segredo da técnica suprema.'
  },

  // ── HETERODOXAS ────────────────────────────────────────────────────
  {
    name: 'Seita do Abismo Negro',
    kanji: '黑淵教',
    alignment: 'heterodox',
    specialty: 'demonic_cultivation',
    description: 'Cultivadores do caminho demoníaco. Poder rápido, mas a mente corrompe.',
    minRealm: 0,
    karmaRequired: -50,
    location: 'Abismo do Caos',
    bonuses: { demonicPower: 0.35, cultivateSpeed: 0.20, karma: -20 },
    techniques: ['Arte do Abismo', 'Devoração de Almas', 'Domínio das Sombras'],
    lore: 'Seu líder, o Demônio Supremo, sobreviveu a sua própria tribulação corrompendo-a.'
  },
  {
    name: 'Seita da Chama Sangrenta',
    kanji: '血焰門',
    alignment: 'heterodox',
    specialty: 'qi_stealing',
    description: 'Roubam Qi de outros cultivadores para crescer. Proibidos em todas as cidades sagradas.',
    minRealm: 2,
    karmaRequired: -100,
    location: 'Floresta da Chama Eterna',
    bonuses: { qiSteal: 0.30, firePower: 0.25 },
    techniques: ['Técnica do Roubo de Qi', 'Chama Sangrenta', 'Drenagem Espiritual'],
    lore: 'Dizem que seu fundador roubou o núcleo de um cultivador imortal e ascendeu através dele.'
  },
  {
    name: 'Seita das Sombras Eternas',
    kanji: '永影派',
    alignment: 'heterodox',
    specialty: 'assassination',
    description: 'Assassinos das sombras. Contratos, venenos e técnicas proibidas.',
    minRealm: 0,
    karmaRequired: -30,
    location: 'Cidade Subterrânea das Sombras',
    bonuses: { stealth: 0.40, poison: 0.35, critDmg: 0.30 },
    techniques: ['Passo das Sombras', 'Mil Venenos', 'Golpe do Fantasma'],
    lore: 'Ninguém sabe onde ficam. Aparecem, matam e somem. Seu líder nunca foi visto.'
  },

  // ── NEUTRAS ────────────────────────────────────────────────────────
  {
    name: 'Pavilhão das Dez Mil Espadas',
    kanji: '萬劍閣',
    alignment: 'neutral',
    specialty: 'any_sword',
    description: 'Qualquer mestre de espada é bem-vindo. Sem restrições de caminho.',
    minRealm: 0,
    swordRootRequired: true,
    location: 'Desfiladeiro das Espadas',
    bonuses: { swordDmg: 0.30, swordXp: 0.25 },
    techniques: ['Dez Mil Cortes', 'Espada do Espírito', 'Resonância de Espada'],
    lore: 'Qualquer espada, qualquer caminho. Aqui só importa o quanto você ama a sua lâmina.'
  },
  {
    name: 'Academia do Conhecimento Eterno',
    kanji: '永知院',
    alignment: 'neutral',
    specialty: 'formations_lore',
    description: 'Pesquisa, formações e lore do mundo. Mente acima de tudo.',
    minRealm: 0,
    spiritRequired: 50,
    location: 'Biblioteca do Mundo Eterno',
    bonuses: { spiritXp: 0.25, formationPower: 0.35 },
    techniques: ['Formação dos Oito Trigramas', 'Leitura do Dao', 'Barreira Eterna'],
    lore: 'Possuem uma cópia de toda técnica já descoberta. Dizem que nos andares inferiores há técnicas proibidas.'
  },
  {
    name: 'Mercadores do Jade',
    kanji: '玉商會',
    alignment: 'neutral',
    specialty: 'trade_economy',
    description: 'A maior associação de comércio do mundo. Ouro fala mais alto.',
    minRealm: 0,
    goldRequired: 10000,
    location: 'Cidade do Jade Dourado',
    bonuses: { marketDiscount: 0.20, auctionBonus: 0.15, charisma: 15 },
    techniques: ['Arte da Negociação', 'Olho do Mercador', 'Rede de Contatos'],
    lore: 'Nenhuma guerra começa sem que eles saibam. Financiam seitas ortodogas e heterodoxas igualmente.'
  },
];

module.exports = { PREBUILT_SECTS };
