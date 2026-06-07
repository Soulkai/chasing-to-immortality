export type WeightedOption<T> = T & { weight: number }

export type RollOption = {
  name: string
  level?: number
  rarity: string
  description: string
  weight: number
  bonuses?: Partial<BaseAttributes>
}

export type BaseAttributes = {
  strength: number
  constitution: number
  agility: number
  intelligence: number
  perception: number
  spirit: number
  willpower: number
  charisma: number
  luckAttribute: number
}

export type InitialRoll = {
  race: RollOption
  clan: RollOption
  talent: RollOption & { level: number }
  destiny: RollOption & { level: number }
  luck: RollOption & { level: number }
  spiritualRoot: RollOption
  divineBody: RollOption
  region: RollOption
  attributes: BaseAttributes
}

export const rarityIcons: Record<string, string> = {
  Comum: '⚪',
  Incomum: '🟢',
  Raro: '🔵',
  Épico: '🟣',
  Lendário: '🟠',
  Mítico: '🔴',
  Celestial: '🌌',
  Primordial: '⚫'
}

export const races: RollOption[] = [
  { name: 'Humano', rarity: 'Comum', description: 'Versátil e adaptável, capaz de trilhar qualquer Dao.', weight: 460, bonuses: { intelligence: 1, willpower: 1 } },
  { name: 'Meio-Demônio', rarity: 'Incomum', description: 'Sangue feroz e instinto de batalha, mas carrega desconfiança social.', weight: 160, bonuses: { strength: 2, constitution: 1, charisma: -1 } },
  { name: 'Espírito da Montanha', rarity: 'Raro', description: 'Nascido do Qi terrestre, resistente e ligado à natureza.', weight: 70, bonuses: { constitution: 3, perception: 1, agility: -1 } },
  { name: 'Descendente Dracônico', rarity: 'Épico', description: 'Carrega uma fração do sangue de dragões antigos.', weight: 25, bonuses: { strength: 3, constitution: 2, spirit: 1 } },
  { name: 'Filho do Vazio', rarity: 'Lendário', description: 'Uma existência rara que parece escapar do olhar dos Céus.', weight: 8, bonuses: { perception: 3, spirit: 3, luckAttribute: 1 } },
  { name: 'Semente Primordial', rarity: 'Primordial', description: 'Um ser quase impossível, nascido com traços anteriores à era atual.', weight: 1, bonuses: { strength: 4, constitution: 4, spirit: 4, willpower: 4 } }
]

export const clans: RollOption[] = [
  { name: 'Clã da Chama Pálida', rarity: 'Comum', description: 'Um clã antigo de forjadores e cultivadores do fogo.', weight: 180, bonuses: { strength: 1, spirit: 1 } },
  { name: 'Clã Lua Serena', rarity: 'Comum', description: 'Família conhecida por técnicas de cura, água e meditação.', weight: 180, bonuses: { spirit: 1, intelligence: 1 } },
  { name: 'Clã Punho de Pedra', rarity: 'Incomum', description: 'Clã marcial que valoriza corpo, disciplina e resistência.', weight: 120, bonuses: { constitution: 2, strength: 1 } },
  { name: 'Clã Espada do Vento', rarity: 'Raro', description: 'Discípulos rápidos, orgulhosos e ligados ao Dao da Espada.', weight: 60, bonuses: { agility: 2, perception: 1 } },
  { name: 'Clã Olho Celestial', rarity: 'Épico', description: 'Linhagem misteriosa que enxerga padrões ocultos do mundo.', weight: 20, bonuses: { perception: 3, intelligence: 2 } },
  { name: 'Clã Sem Nome', rarity: 'Lendário', description: 'Poucos lembram sua origem; seus herdeiros sempre aparecem em tempos caóticos.', weight: 6, bonuses: { willpower: 3, luckAttribute: 2 } }
]

export const talents: (RollOption & { level: number })[] = [
  { level: 0, name: 'Aleijado Espiritual', rarity: 'Comum', description: '-40% cultivo, -20% rompimento.', weight: 20 },
  { level: 1, name: 'Mortal', rarity: 'Comum', description: '-20% cultivo.', weight: 80 },
  { level: 2, name: 'Comum', rarity: 'Comum', description: 'Sem bônus especial.', weight: 350 },
  { level: 3, name: 'Promissor', rarity: 'Incomum', description: '+5% cultivo.', weight: 250 },
  { level: 4, name: 'Talentoso', rarity: 'Incomum', description: '+10% cultivo.', weight: 150 },
  { level: 5, name: 'Raro', rarity: 'Raro', description: '+15% cultivo, +2% epifania.', weight: 80 },
  { level: 6, name: 'Gênio', rarity: 'Épico', description: '+25% cultivo, +5% epifania.', weight: 40 },
  { level: 7, name: 'Monstro do Dao', rarity: 'Lendário', description: '+40% cultivo, +8% epifania.', weight: 20 },
  { level: 8, name: 'Filho dos Céus', rarity: 'Mítico', description: '+60% cultivo, +12% epifania.', weight: 7 },
  { level: 9, name: 'Anomalia Celestial', rarity: 'Celestial', description: '+85% cultivo, +18% epifania.', weight: 2.5 },
  { level: 10, name: 'Encarnação do Dao', rarity: 'Primordial', description: '+120% cultivo, +25% epifania.', weight: 0.5 }
]

export const destinies: (RollOption & { level: number })[] = [
  { level: 0, name: 'Destino Quebrado', rarity: 'Comum', description: 'O azar parece seguir seus passos.', weight: 20 },
  { level: 1, name: 'Destino Fraco', rarity: 'Comum', description: 'Poucos encontros especiais.', weight: 80 },
  { level: 2, name: 'Destino Comum', rarity: 'Comum', description: 'Um caminho normal sob os Céus.', weight: 300 },
  { level: 3, name: 'Destino Estável', rarity: 'Incomum', description: 'Leve proteção contra azar.', weight: 250 },
  { level: 4, name: 'Destino Ascendente', rarity: 'Incomum', description: 'Mais eventos positivos.', weight: 170 },
  { level: 5, name: 'Fio Carmesim', rarity: 'Raro', description: 'Encontros sociais e aliados aparecem com mais frequência.', weight: 80 },
  { level: 6, name: 'Sangue de Imperador', rarity: 'Épico', description: 'Liderança, carisma e facilidade em criar seita.', weight: 35 },
  { level: 7, name: 'Protegido pelo Dao', rarity: 'Lendário', description: 'Chance ocasional de escapar de fatalidade.', weight: 18 },
  { level: 8, name: 'Destino Anômalo', rarity: 'Mítico', description: 'Eventos únicos, mas riscos maiores.', weight: 8 },
  { level: 9, name: 'Destino do Protagonista', rarity: 'Celestial', description: 'Sorte absurda e inimigos igualmente absurdos.', weight: 3 },
  { level: 10, name: 'Destino Além do Dao', rarity: 'Primordial', description: 'Pode alterar as regras da reencarnação.', weight: 0.7 }
]

export const luckLevels: (RollOption & { level: number })[] = [
  { level: 0, name: 'Amaldiçoado', rarity: 'Comum', description: 'Eventos ruins aparecem com frequência.', weight: 25 },
  { level: 1, name: 'Muito Azarado', rarity: 'Comum', description: '-15% drops.', weight: 80 },
  { level: 2, name: 'Azarado', rarity: 'Comum', description: '-8% drops.', weight: 120 },
  { level: 3, name: 'Normal', rarity: 'Comum', description: 'Sem bônus ou penalidade.', weight: 330 },
  { level: 4, name: 'Sortudo', rarity: 'Incomum', description: '+5% drops.', weight: 220 },
  { level: 5, name: 'Abençoado', rarity: 'Raro', description: '+10% drops, +2% evento raro.', weight: 120 },
  { level: 6, name: 'Favorecido', rarity: 'Épico', description: '+18% drops, +5% evento raro.', weight: 60 },
  { level: 7, name: 'Filho da Fortuna', rarity: 'Lendário', description: '+25% drops, +8% evento raro.', weight: 30 },
  { level: 8, name: 'Fortuna Celestial', rarity: 'Mítico', description: '+40% drops e eventos únicos.', weight: 10 },
  { level: 9, name: 'Fortuna Imortal', rarity: 'Celestial', description: '+60% drops e proteção ocasional.', weight: 4 },
  { level: 10, name: 'Fortuna Além dos Céus', rarity: 'Primordial', description: 'A sorte dobra a realidade ao seu redor.', weight: 1 }
]

export const spiritualRoots: RollOption[] = [
  { name: 'Raiz de Fogo', rarity: 'Comum', description: 'Boa para técnicas ofensivas de fogo.', weight: 120, bonuses: { spirit: 1 } },
  { name: 'Raiz de Água', rarity: 'Comum', description: 'Boa para cura, defesa e flexibilidade.', weight: 120, bonuses: { spirit: 1 } },
  { name: 'Raiz de Terra', rarity: 'Comum', description: 'Boa para defesa e formações.', weight: 120, bonuses: { constitution: 1, spirit: 1 } },
  { name: 'Raiz de Madeira', rarity: 'Comum', description: 'Boa para alquimia e vitalidade.', weight: 110, bonuses: { intelligence: 1, constitution: 1 } },
  { name: 'Raiz de Metal', rarity: 'Comum', description: 'Boa para espada, forja e ataque preciso.', weight: 110, bonuses: { strength: 1, perception: 1 } },
  { name: 'Raiz Dupla Fogo/Terra', rarity: 'Incomum', description: 'Combina força ofensiva e estabilidade.', weight: 70, bonuses: { strength: 1, spirit: 2 } },
  { name: 'Raiz do Trovão', rarity: 'Raro', description: 'Violenta, rara e veloz.', weight: 35, bonuses: { agility: 2, spirit: 2 } },
  { name: 'Raiz Yin Supremo', rarity: 'Épico', description: 'Fria, profunda e poderosa em alma.', weight: 12, bonuses: { spirit: 3, willpower: 2 } },
  { name: 'Raiz Yang Supremo', rarity: 'Épico', description: 'Ardente, vital e dominante.', weight: 12, bonuses: { strength: 2, constitution: 2, spirit: 2 } },
  { name: 'Raiz do Vazio', rarity: 'Lendário', description: 'Rara, instável e ligada ao espaço.', weight: 5, bonuses: { perception: 3, spirit: 3 } },
  { name: 'Raiz Caótica', rarity: 'Celestial', description: 'Todas as coisas e nenhuma ao mesmo tempo.', weight: 1, bonuses: { spirit: 5, intelligence: 2, willpower: 2 } }
]

export const divineBodies: RollOption[] = [
  { name: 'Nenhum', rarity: 'Comum', description: 'Você não nasceu com um corpo especial.', weight: 830 },
  { name: 'Corpo de Jade', rarity: 'Raro', description: 'Resistência e defesa superiores.', weight: 70, bonuses: { constitution: 4 } },
  { name: 'Corpo do Trovão', rarity: 'Épico', description: 'Velocidade e afinidade com raio.', weight: 35, bonuses: { agility: 3, spirit: 2 } },
  { name: 'Corpo Yin Supremo', rarity: 'Lendário', description: 'Poderoso em técnicas de alma, gelo e ilusão.', weight: 18, bonuses: { spirit: 3, willpower: 3 } },
  { name: 'Corpo Yang Ardente', rarity: 'Lendário', description: 'Vitalidade explosiva, fogo e força.', weight: 18, bonuses: { strength: 3, constitution: 3 } },
  { name: 'Corpo Demoníaco Ancestral', rarity: 'Mítico', description: 'Força brutal com tendência a karma negativo.', weight: 8, bonuses: { strength: 5, constitution: 3, willpower: 1 } },
  { name: 'Corpo do Dao Inato', rarity: 'Celestial', description: 'Compreensão natural de técnicas e epifanias.', weight: 3, bonuses: { intelligence: 4, spirit: 4, perception: 2 } },
  { name: 'Corpo Imortal Primordial', rarity: 'Primordial', description: 'Regeneração e fundamento quase impossíveis.', weight: 1, bonuses: { constitution: 6, spirit: 3, willpower: 3 } }
]

export const regions: RollOption[] = [
  { name: 'Vale das Nuvens Partidas', rarity: 'Comum', description: 'Um vale isolado onde o Qi é fino, mas estável.', weight: 180 },
  { name: 'Cidade Rio de Jade', rarity: 'Comum', description: 'Centro comercial de cultivadores iniciantes.', weight: 160 },
  { name: 'Montanha dos Mil Degraus', rarity: 'Incomum', description: 'Lugar duro, famoso por treinar corpos resistentes.', weight: 100 },
  { name: 'Floresta das Mil Sombras', rarity: 'Raro', description: 'Cheia de bestas, ervas e ruínas ocultas.', weight: 70 },
  { name: 'Deserto do Sol Quebrado', rarity: 'Épico', description: 'Perigoso, antigo e rico em heranças esquecidas.', weight: 30 },
  { name: 'Ilha do Vazio Quieto', rarity: 'Lendário', description: 'Um lugar raro onde espaço e alma se misturam.', weight: 8 }
]

export function weightedPick<T extends { weight: number }>(options: T[]): T {
  const total = options.reduce((sum, item) => sum + item.weight, 0)
  let roll = Math.random() * total
  for (const option of options) {
    roll -= option.weight
    if (roll <= 0) return option
  }
  return options[options.length - 1]
}

export function addAttributes(base: BaseAttributes, bonus?: Partial<BaseAttributes>): BaseAttributes {
  return {
    strength: base.strength + (bonus?.strength ?? 0),
    constitution: base.constitution + (bonus?.constitution ?? 0),
    agility: base.agility + (bonus?.agility ?? 0),
    intelligence: base.intelligence + (bonus?.intelligence ?? 0),
    perception: base.perception + (bonus?.perception ?? 0),
    spirit: base.spirit + (bonus?.spirit ?? 0),
    willpower: base.willpower + (bonus?.willpower ?? 0),
    charisma: base.charisma + (bonus?.charisma ?? 0),
    luckAttribute: base.luckAttribute + (bonus?.luckAttribute ?? 0)
  }
}

export function generateBaseAttributes(): BaseAttributes {
  return {
    strength: 5 + Math.floor(Math.random() * 6),
    constitution: 5 + Math.floor(Math.random() * 6),
    agility: 5 + Math.floor(Math.random() * 6),
    intelligence: 5 + Math.floor(Math.random() * 6),
    perception: 5 + Math.floor(Math.random() * 6),
    spirit: 5 + Math.floor(Math.random() * 6),
    willpower: 5 + Math.floor(Math.random() * 6),
    charisma: 5 + Math.floor(Math.random() * 6),
    luckAttribute: 3 + Math.floor(Math.random() * 5)
  }
}

export function generateInitialRoll(): InitialRoll {
  const race = weightedPick(races)
  const clan = weightedPick(clans)
  const talent = weightedPick(talents)
  const destiny = weightedPick(destinies)
  const luck = weightedPick(luckLevels)
  const spiritualRoot = weightedPick(spiritualRoots)
  const divineBody = weightedPick(divineBodies)
  const region = weightedPick(regions)

  let attributes = generateBaseAttributes()
  for (const source of [race, clan, spiritualRoot, divineBody]) {
    attributes = addAttributes(attributes, source.bonuses)
  }
  attributes.luckAttribute += luck.level

  return { race, clan, talent, destiny, luck, spiritualRoot, divineBody, region, attributes }
}

export function karmaTitle(value: number): string {
  if (value >= 800) return 'Santo Vivo'
  if (value >= 500) return 'Virtuoso'
  if (value >= 200) return 'Honrado'
  if (value >= 50) return 'Bondoso'
  if (value >= 8) return 'Alma Virtuosa'
  if (value >= 4) return 'Bondoso'
  if (value >= 1) return 'Inclinado ao Bem'
  if (value === 0) return 'Neutro'
  if (value >= -3) return 'Egoísta'
  if (value >= -7) return 'Cruel'
  if (value >= -10) return 'Semente Demoníaca'
  if (value >= -199) return 'Egoísta'
  if (value >= -499) return 'Cruel'
  if (value >= -799) return 'Demoníaco'
  return 'Calamidade Viva'
}

export function calculateVitals(attributes: BaseAttributes, bodyRealmIndex = 0, spiritRealmIndex = 1, soulRealmIndex = 0) {
  const maxHp = Math.max(100, 50 + attributes.constitution * 5 + attributes.strength * 2 + bodyRealmIndex * 15)
  const maxQi = Math.max(50, 20 + attributes.spirit * 4 + attributes.intelligence * 2 + spiritRealmIndex * 20)
  const maxSoulPower = Math.max(30, 10 + attributes.spirit * 2 + attributes.willpower * 3 + soulRealmIndex * 20)
  return { maxHp, maxQi, maxSoulPower }
}

export const moralityQuestions = [
  {
    question: 'Você vê um senhor sendo assaltado por três bandidos em uma estrada.',
    answers: [
      'Ajudo imediatamente, mesmo correndo risco.',
      'Tento resolver conversando.',
      'Observo antes de agir.',
      'Ignoro, não é problema meu.',
      'Aproveito a confusão para roubar ambos.'
    ]
  },
  {
    question: 'Você encontra uma pílula rara caída no chão. Ninguém está por perto.',
    answers: [
      'Procuro o dono.',
      'Entrego para uma autoridade local.',
      'Guardo, mas tento descobrir de quem era.',
      'Fico com ela.',
      'Vendo a pílula e finjo que nunca vi.'
    ]
  },
  {
    question: 'Um discípulo mais fraco o desafia publicamente.',
    answers: [
      'Recuso e dou um conselho.',
      'Aceito, mas luto sem machucá-lo muito.',
      'Aceito normalmente.',
      'Humilho ele para mostrar superioridade.',
      'Aleijo ele para que ninguém mais ouse me desafiar.'
    ]
  },
  {
    question: 'Sua seita está em perigo, mas fugir salvaria sua vida.',
    answers: [
      'Fico e defendo todos.',
      'Ajudo os mais fracos a escapar.',
      'Luto enquanto houver chance de vitória.',
      'Fujo sozinho.',
      'Aproveito o caos para roubar o tesouro da seita.'
    ]
  },
  {
    question: 'Você encontra uma técnica proibida extremamente poderosa.',
    answers: [
      'Destruo a técnica.',
      'Selo a técnica e aviso os anciãos.',
      'Estudo com cuidado.',
      'Aprendo escondido.',
      'Uso a técnica, mesmo que ela exija sacrifícios.'
    ]
  }
]

export function moralityAnswerToKarma(answer: number): number {
  const table: Record<number, number> = { 1: 2, 2: 1, 3: 0, 4: -1, 5: -2 }
  return table[answer] ?? 0
}
