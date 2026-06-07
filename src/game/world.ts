export type RegionDef = {
  name: string
  danger: number
  minSpiritRealm: number
  qiDensity: number
  description: string
  travel: string[]
  npcs: string[]
  resources: string[]
  beasts: string[]
}

export const spiritRealms = [
  'Mortal',
  'Condensação de Qi',
  'Fundação Espiritual',
  'Núcleo Dourado',
  'Alma Nascente',
  'Transformação da Alma',
  'Vazio Espiritual',
  'Integração do Dao',
  'Tribulação Celestial',
  'Imortal Terreno',
  'Imortal Celestial',
  'Soberano Dao'
]

export const bodyRealms = [
  'Corpo Mortal',
  'Refinamento dos Ossos',
  'Sangue Fervente',
  'Corpo de Ferro',
  'Corpo de Jade',
  'Corpo Demoníaco',
  'Corpo Sagrado',
  'Corpo Imortal',
  'Corpo Primordial'
]

export const soulRealms = [
  'Alma Adormecida',
  'Alma Desperta',
  'Sentido Espiritual',
  'Mar da Consciência',
  'Alma Cristalina',
  'Alma Divina',
  'Espírito Imortal',
  'Alma do Dao'
]

export const regions: RegionDef[] = [
  {
    name: 'Vale das Nuvens Partidas', danger: 1, minSpiritRealm: 0, qiDensity: 1,
    description: 'Vale inicial de Qi fino e seguro, cheio de aldeias, campos de ervas e pequenas cavernas.',
    travel: ['Cidade Rio de Jade', 'Montanha dos Mil Degraus'],
    npcs: ['Velho Mo', 'Guarda Lin', 'Herbalista Qiao'], resources: ['Erva da Névoa', 'Pedra Espiritual Quebrada', 'Raiz Amarga'], beasts: ['Lobo da Névoa', 'Javali de Chifre']
  },
  {
    name: 'Cidade Rio de Jade', danger: 1, minSpiritRealm: 0, qiDensity: 1,
    description: 'Centro comercial dos cultivadores iniciantes. Leilões, lojas, tavernas e missões de mercadores.',
    travel: ['Vale das Nuvens Partidas', 'Floresta das Mil Sombras', 'Porto do Lótus Azul'],
    npcs: ['Mercadora Mei', 'Fiscal Han', 'Médico Su'], resources: ['Contrato Comercial', 'Pílula Básica', 'Talismã Barato'], beasts: ['Ladrão de Rua', 'Mercenário Renegado']
  },
  {
    name: 'Montanha dos Mil Degraus', danger: 2, minSpiritRealm: 0, qiDensity: 2,
    description: 'Uma montanha de ventos cortantes, usada por cultivadores físicos para fortalecer ossos e sangue.',
    travel: ['Vale das Nuvens Partidas', 'Templo da Rocha Calada'],
    npcs: ['Monge Gan', 'Ferreiro Bo', 'Carregador Tian'], resources: ['Minério Negro', 'Flor do Penhasco', 'Osso Temperado'], beasts: ['Macaco de Pedra', 'Águia da Escarpa']
  },
  {
    name: 'Floresta das Mil Sombras', danger: 3, minSpiritRealm: 1, qiDensity: 2,
    description: 'Floresta densa onde bestas espirituais, ervas raras e ruínas de seitas antigas surgem sob a neblina.',
    travel: ['Cidade Rio de Jade', 'Ruínas da Seita Lua Quebrada'],
    npcs: ['Caçadora Yue', 'Discípulo Errante Zhen', 'Mestre de Formações Lu'], resources: ['Cogumelo Lunar', 'Madeira Espiritual', 'Orvalho Yin'], beasts: ['Tigre Sombra', 'Serpente de Jade']
  },
  {
    name: 'Porto do Lótus Azul', danger: 2, minSpiritRealm: 1, qiDensity: 2,
    description: 'Porto espiritual com comerciantes de ilhas distantes, piratas do Qi e receitas raras de alquimia.',
    travel: ['Cidade Rio de Jade', 'Ilha do Vazio Quieto'],
    npcs: ['Capitão Shen', 'Alquimista Ruo', 'Pescador Cego'], resources: ['Pérola de Qi', 'Escama Azul', 'Sal Espiritual'], beasts: ['Carpa Demoníaca', 'Pirata do Rio']
  },
  {
    name: 'Ruínas da Seita Lua Quebrada', danger: 5, minSpiritRealm: 2, qiDensity: 3,
    description: 'Ruínas proibidas. Formações quebradas, sombras de discípulos mortos e câmaras de herança.',
    travel: ['Floresta das Mil Sombras', 'Deserto do Sol Quebrado'],
    npcs: ['Sombra da Anciã Lan', 'Guardião Sem Alma'], resources: ['Fragmento de Técnica', 'Jade Antigo', 'Cinzas Lunares'], beasts: ['Fantasma de Discípulo', 'Guardião de Pedra']
  },
  {
    name: 'Deserto do Sol Quebrado', danger: 6, minSpiritRealm: 3, qiDensity: 3,
    description: 'Deserto vermelho com tempestades solares, tumbas de imortais e tribulações repentinas.',
    travel: ['Ruínas da Seita Lua Quebrada'],
    npcs: ['Ermitão do Sol Partido', 'Mercadora de Ossos'], resources: ['Areia Solar', 'Cristal Ardente', 'Sangue Seco de Besta'], beasts: ['Escorpião Solar', 'Abutre Flamejante']
  },
  {
    name: 'Ilha do Vazio Quieto', danger: 7, minSpiritRealm: 3, qiDensity: 4,
    description: 'Ilha lendária onde espaço e alma se distorcem; cultivadores ouvem vozes de vidas passadas.',
    travel: ['Porto do Lótus Azul'],
    npcs: ['Barqueiro do Vazio', 'Oráculo Mudo'], resources: ['Pedra do Vazio', 'Lágrima Estelar', 'Flor Sem Sombra'], beasts: ['Peixe do Vazio', 'Eco da Alma']
  }
]

export const botShop = [
  { id: 'pilula_qi', name: 'Pílula de Qi', price: 120, description: '+80 exp de cultivo espiritual.' },
  { id: 'pilula_cura', name: 'Pílula de Cura', price: 90, description: 'Recupera HP.' },
  { id: 'talismã_retorno', name: 'Talismã de Retorno', price: 250, description: 'Volta ao Vale das Nuvens Partidas.' },
  { id: 'pergaminho_tecnica', name: 'Pergaminho de Técnica Aleatória', price: 600, description: 'Ensina uma técnica comum/rara.' },
  { id: 'pilula_reversao', name: 'Pílula de Reversão do Destino', price: 3500, description: 'Reservada para sistemas avançados de reroll.' }
]

export const techniques = [
  { name: 'Punho Mortal', type: 'físico', rarity: 'Comum', power: 1.0, qiCost: 0, description: 'Ataque básico sem custo.' },
  { name: 'Corte da Brisa', type: 'espada', rarity: 'Comum', power: 1.15, qiCost: 6, description: 'Um corte rápido guiado pelo vento.' },
  { name: 'Palma da Chama Pálida', type: 'fogo', rarity: 'Incomum', power: 1.35, qiCost: 10, description: 'Palma ardente herdada de clãs de forjadores.' },
  { name: 'Passos da Garça Sombria', type: 'movimento', rarity: 'Raro', power: 0.85, qiCost: 8, description: 'Menor dano, maior chance de esquiva e fuga.' },
  { name: 'Espada das Nove Chuvas', type: 'água', rarity: 'Épico', power: 1.7, qiCost: 22, description: 'Técnica fluida que ataca como uma tempestade.' },
  { name: 'Selo da Alma Fria', type: 'alma', rarity: 'Lendário', power: 2.0, qiCost: 35, description: 'Fere HP e alma do inimigo.' }
]
