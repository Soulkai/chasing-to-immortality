const { RACES, rollRace } = require('../../data/races');
const { CLANS, rollClan } = require('../../data/clans');
const { rollTalents } = require('../../data/talents');
const Player = require('../../models/Player');
const Technique = require('../../models/Technique');
const Item = require('../../models/Item');
const { QI_REALMS, BODY_REALMS, MIND_REALMS, getRealmName } = require('../../data/realms');
const { formatCurrency, rarityEmoji, progressBar } = require('../../utils/format');

const PENDING_REGISTRATIONS = new Map(); // key: phone, value: { rollsLeft, draft }

const KARMA_QUESTIONS = [
  {
    question: 'Você vê um senhor sendo assaltado em um beco escuro. O que você faz?',
    answers: [
      { text: 'Ignora e segue seu caminho.', karma: -5 },
      { text: 'Chama ajuda de guardas ou outros cultivadores.', karma: +5 },
      { text: 'Intervém e luta contra os assaltantes, mesmo sendo perigoso.', karma: +10 },
      { text: 'Aproveita a confusão e rouba o velho também.', karma: -10 },
      { text: 'Ajuda apenas se puder tirar algum benefício depois.', karma: -2 },
    ],
  },
  {
    question: 'Um estranho te oferece uma técnica poderosa em troca de um favor obscuro.',
    answers: [
      { text: 'Recusa imediatamente.', karma: +8 },
      { text: 'Aceita sem pensar, poder acima de tudo.', karma: -8 },
      { text: 'Analisa o contrato em detalhes antes de decidir.', karma: +2 },
      { text: 'Aceita, mas planeja trair o estranho depois.', karma: -6 },
      { text: 'Tenta roubar a técnica sem cumprir o acordo.', karma: -10 },
    ],
  },
  {
    question: 'Você encontra um artefato raro em uma ruína, mas sente uma aura sinistra.',
    answers: [
      { text: 'Leva sem hesitar, o poder vale qualquer risco.', karma: -6 },
      { text: 'Ignora, coisas assim sempre têm um preço.', karma: +6 },
      { text: 'Estuda o artefato com cuidado antes de decidir.', karma: +3 },
      { text: 'Vende o artefato para alguém ingênuo.', karma: -8 },
      { text: 'Entrega para uma seita ortodoxa analisar.', karma: +8 },
    ],
  },
  {
    question: 'Um discípulo fraco da sua seita te pede ajuda em um treino difícil.',
    answers: [
      { text: 'Ajuda sem pedir nada em troca.', karma: +8 },
      { text: 'Ajuda, mas cobra um favor futuro.', karma: +2 },
      { text: 'Ignora, não tem tempo para fracos.', karma: -4 },
      { text: 'Usa o treino para humilhar o discípulo.', karma: -8 },
      { text: 'Ensina um pouco, mas guarda os segredos reais.', karma: 0 },
    ],
  },
  {
    question: 'Você derrota um inimigo que implora por misericórdia.',
    answers: [
      { text: 'Poupa a vida dele, mas o expulsa do seu caminho.', karma: +6 },
      { text: 'Mata sem hesitar, inimigos são inimigos.', karma: -6 },
      { text: 'Marca o inimigo com um selo para controlar suas ações.', karma: -2 },
      { text: 'Entrega o inimigo para julgamento em uma seita.', karma: +4 },
      { text: 'Rouba tudo e deixa-o viver para espalhar seu nome.', karma: -3 },
    ],
  },
];

module.exports = {
  name: 'registrar',
  aliases: ['registro', 'start'],
  async execute({ sock, msg, from, sender, args }) {
    const phone = sender.split('@')[0];

    const existing = await Player.findOne({ phone });
    if (existing) {
      return sock.sendMessage(from, { text: '⚠️ Você já possui um personagem neste mundo. Use !perfil para vê-lo.' });
    }

    const pending = PENDING_REGISTRATIONS.get(phone);
    if (!args.length && pending) {
      return sock.sendMessage(from, { text: 'Você já está no processo de criação. Responda com 1, 2, 3, 4 ou 5 nas perguntas de índole.' });
    }

    if (args.length < 2) {
      return sock.sendMessage(from, { text: 'Uso: !registrar NomeDoPersonagem Sexo(M/F)\nExemplo: !registrar Nie Li M' });
    }

    const genderRaw = args[args.length - 1].toUpperCase();
    const name = args.slice(0, -1).join(' ');

    if (!['M', 'F'].includes(genderRaw)) {
      return sock.sendMessage(from, { text: 'Informe o sexo como M ou F. Exemplo: !registrar Nie Li M' });
    }

    if (name.length < 3 || name.length > 24) {
      return sock.sendMessage(from, { text: 'O nome do personagem deve ter entre 3 e 24 caracteres.' });
    }

    const race = rollRace();
    const clan = rollClan();
    const talents = rollTalents();

    const rollsLeft = pending ? pending.rollsLeft - 1 : 3;

    const draft = {
      phone,
      name,
      gender: genderRaw,
      race,
      clan,
      talents,
      karmaAnswers: [],
      currentQuestion: 0,
    };

    const needsConfirm = rollsLeft > 0;

    if (!needsConfirm) {
      PENDING_REGISTRATIONS.set(phone, { rollsLeft: 0, draft });
      return askKarmaQuestion(sock, from, phone);
    }

    PENDING_REGISTRATIONS.set(phone, { rollsLeft, draft });

    const talentsText = talents
      .map(t => `${rarityEmoji(t.rarity)} ${t.name}`)
      .join('\n');

    const storyText = buildNarrativeIntro(draft);

    let text = `${storyText}\n\n` +
      `🎲 Seu destino inicial foi traçado:\n` +
      `🧬 Raça: ${race.name} (${race.category})\n` +
      `🏛️ Clã de Origem: ${clan.name} (${clan.kanji || ''})\n` +
      `🌟 Talentos:\n${talentsText}\n\n` +
      `Você tem mais ${rollsLeft} chance(s) de desafiar o destino.\n` +
      `Responda com:\n` +
      `1️⃣ — Aceitar este destino\n` +
      `2️⃣ — Recusar e sortear novamente`;

    await sock.sendMessage(from, { text });

    const listener = async ({ messages }) => {
      for (const m of messages) {
        if (!m.message || m.key.remoteJid !== from || (m.key.participant || m.key.remoteJid) !== sender) continue;
        const body = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
        const choice = body.trim();
        if (!['1', '2'].includes(choice)) return;

        sock.ev.off('messages.upsert', listener);

        const state = PENDING_REGISTRATIONS.get(phone);
        if (!state) return;

        if (choice === '2') {
          if (state.rollsLeft <= 0) {
            await sock.sendMessage(from, { text: 'Você já desafiou o destino muitas vezes. O próximo resultado será final.' });
          }
          PENDING_REGISTRATIONS.delete(phone);
          return module.exports.execute({ sock, msg, from, sender, args });
        }

        PENDING_REGISTRATIONS.set(phone, { ...state, draft: { ...state.draft }, confirmed: true });
        return askKarmaQuestion(sock, from, phone);
      }
    };

    sock.ev.on('messages.upsert', listener);
  },
};

async function askKarmaQuestion(sock, from, phone) {
  const state = PENDING_REGISTRATIONS.get(phone);
  if (!state) return;
  const { draft } = state;

  if (draft.currentQuestion >= KARMA_QUESTIONS.length) {
    return finalizeRegistration(sock, from, phone);
  }

  const q = KARMA_QUESTIONS[draft.currentQuestion];
  let text = `🧭 Seu coração será testado... (${draft.currentQuestion + 1}/5)\n\n`;
  text += `${q.question}\n\n`;
  q.answers.forEach((a, idx) => {
    text += `${idx + 1}. ${a.text}\n`;
  });
  text += '\nResponda com 1, 2, 3, 4 ou 5.';

  await sock.sendMessage(from, { text });

  const listener = async ({ messages }) => {
    for (const m of messages) {
      if (!m.message || m.key.remoteJid !== from || (m.key.participant || m.key.remoteJid) !== `${phone}@s.whatsapp.net`) continue;
      const body = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
      const num = parseInt(body.trim(), 10);
      if (isNaN(num) || num < 1 || num > 5) return;

      sock.ev.off('messages.upsert', listener);

      const st = PENDING_REGISTRATIONS.get(phone);
      if (!st) return;
      const qNow = KARMA_QUESTIONS[st.draft.currentQuestion];
      const answer = qNow.answers[num - 1];

      st.draft.karmaAnswers.push(answer.karma);
      st.draft.currentQuestion += 1;
      PENDING_REGISTRATIONS.set(phone, st);

      return askKarmaQuestion(sock, from, phone);
    }
  };

  sock.ev.on('messages.upsert', listener);
}

async function finalizeRegistration(sock, from, phone) {
  const state = PENDING_REGISTRATIONS.get(phone);
  if (!state) return;
  const { draft } = state;

  const baseKarma = draft.karmaAnswers.reduce((a, b) => a + b, 0);
  const raceKarma = draft.race.buffs?.karma || 0;
  const clanKarma = draft.clan.buffs?.karma || 0;
  let karma = baseKarma + raceKarma + clanKarma;

  if (karma > 100) karma = 100;
  if (karma < -100) karma = -100;

  const attributes = {
    strength: 10 + (draft.race.buffs?.strength || 0),
    agility: 10 + (draft.race.buffs?.agility || 0),
    endurance: 10 + (draft.race.buffs?.endurance || 0),
    spirit: 10 + (draft.race.buffs?.spirit || 0),
    perception: 10 + (draft.race.buffs?.perception || 0),
    willpower: 10 + (draft.race.buffs?.willpower || 0),
    charisma: 10 + (draft.race.buffs?.charisma || 0),
    luck: 10 + (draft.race.buffs?.luck || 0),
    karma,
    hunger: 100,
  };

  const hpBase = 80;
  const qiBase = 40;
  const hp = Math.max(hpBase, 50 + attributes.endurance * 5 + attributes.strength * 2);
  const qi = Math.max(qiBase, 30 + attributes.spirit * 4 + attributes.perception * 2);

  attributes.hp = hp;
  attributes.maxHp = hp;
  attributes.qi = qi;
  attributes.maxQi = qi;
  attributes.attack = 10 + Math.floor(attributes.strength * 1.5);
  attributes.defense = 8 + Math.floor(attributes.endurance * 1.2);
  attributes.speed = 10 + Math.floor(attributes.agility * 1.2);

  // Técnica inicial por tipo de clã
  let startingTechName = 'Respiração da Bruma Serena';
  if (draft.clan.specialty === 'alchemy') startingTechName = 'Coração Espehado do Dao';
  if (draft.clan.specialty === 'sword') startingTechName = 'Caminho da Lâmina Carmesim';
  if (draft.clan.specialty === 'demonic') startingTechName = 'Canção dos Meridianos Caóticos';

  const startingTech = await Technique.findOne({ name: startingTechName });

  const player = await Player.create({
    phone,
    name: draft.name,
    gender: draft.gender,
    race: draft.race.name,
    raceRarity: draft.race.category,
    clan: draft.clan.name,
    talents: draft.talents.map(t => ({ name: t.name, rarity: t.rarity, description: t.description })),
    attributes,
    lives: 9,
    lifeNumber: 1,
    location: 'Aldeia do Início',
    region: 'Terras do Início',
  });

  // Equipamento e comida inicial
  const tunic = await Item.findOne({ name: 'Túnica de Discípulo da Aldeia' });
  const sword = await Item.findOne({ name: 'Espada de Ferro Simples' });
  const bread = await Item.findOne({ name: 'Pão de Grãos Espirituais' });
  const water = await Item.findOne({ name: 'Água de Fonte Serena' });

  if (tunic) player.equipment.body = tunic._id;
  if (sword) player.equipment.weapon = sword._id;

  if (bread) {
    player.inventory.push({ item: bread._id, quantity: 3 });
  }
  if (water) {
    player.inventory.push({ item: water._id, quantity: 3 });
  }

  // Atribuir técnica inicial ao caminho apropriado
  if (startingTech) {
    if (startingTech.cultivationType === 'qi' || startingTech.paths?.includes('qi')) {
      player.qiCultivation.technique = startingTech._id;
    } else if (startingTech.cultivationType === 'body' || startingTech.paths?.includes('body')) {
      player.bodyCultivation.technique = startingTech._id;
    } else if (startingTech.cultivationType === 'mind' || startingTech.paths?.includes('mind')) {
      player.mindCultivation.technique = startingTech._id;
    }
  }

  await player.save();

  PENDING_REGISTRATIONS.delete(phone);

  const alignment = karma > 30 ? 'Caminho Ortodoxo' : karma < -30 ? 'Caminho Demoníaco' : 'Caminho Neutro';

  const text = `🌌 Um novo fio do destino foi tecido...\n\n` +
    `👤 Nome: ${player.name}\n` +
    `🧬 Raça: ${player.race} (${draft.race.category})\n` +
    `🏛️ Clã de Origem: ${player.clan}\n` +
    `❤️ Vidas: ${player.lives}/9\n` +
    `⚖️ Karma inicial: ${karma} (${alignment})\n` +
    `📜 Técnica Inicial: ${startingTech ? startingTech.name : 'Respiração da Bruma Serena'}\n` +
    `🎒 Itens iniciais: túnica, espada simples, pão e água.\n\n` +
    `Use !perfil para ver sua ficha completa e iniciar sua jornada.`;

  await sock.sendMessage(from, { text });
}

function buildNarrativeIntro(draft) {
  const race = draft.race;
  const clan = draft.clan;
  const name = draft.name;

  let intro = `Nas infinitas teias do destino, um novo cultivador desperta: ${name}.`;

  if (race.category === 'mortal') {
    intro += ` Nascido como um simples ${race.name}, seu caminho parecia destinado à mediocridade... até que o mundo espiritual tocou sua alma.`;
  } else if (race.category === 'awakened') {
    intro += ` O sangue de ${race.name} corre em suas veias, despertando um poder que poucos mortais compreendem.`;
  } else if (race.category === 'ancient') {
    intro += ` Fragmentos de eras antigas sussurram em seu sangue de ${race.name}, lembrando glórias esquecidas.`;
  } else if (race.category === 'divine') {
    intro += ` O próprio céu treme ao perceber um descendente de ${race.name} retornando ao mundo mortal.`;
  } else if (race.category === 'chaos') {
    intro += ` Nem os céus, nem o abismo compreendem totalmente o que significa alguém nascer como ${race.name}. O próprio Dao observa em silêncio.`;
  }

  intro += `\n\nDesde cedo, o nome do ${clan.name} ecoou em seus ouvidos. `;

  if (clan.specialty === 'sword') {
    intro += `Entre espadas que cortam montanhas e técnicas que partem o céu, sua linhagem carrega o fardo de nunca recuar diante de um duelo.`;
  } else if (clan.specialty === 'alchemy') {
    intro += `Pílulas perfumadas, caldeirões fervendo e chamas controladas definem o ritmo de sua infância.`;
  } else if (clan.specialty === 'demonic') {
    intro += `Sussurros sombrios, olhares desconfiados e poder proibido são companheiros constantes de sua linhagem.`;
  } else if (clan.specialty === 'balanced') {
    intro += `Sem uma especialidade única, mas com fundações sólidas, seu clã acredita que versatilidade é a verdadeira força.`;
  } else if (clan.specialty === 'free') {
    intro += `Sem um clã para acorrentar seus passos, o mundo inteiro é ao mesmo tempo mestre e inimigo.`;
  } else {
    intro += `Em meio a tradições ancestrais e expectativas pesadas, você carrega o brasão desse clã nas costas.`;
  }

  return intro;
}
