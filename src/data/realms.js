// Reinos de cultivo — 13 grandes reinos, cada um com 9 sub-níveis

const QI_REALMS = [
  { index: 0,  name: 'Refinamento do Qi',    subNames: ['Qi Bruto','Qi Disperso','Qi Condensado','Qi Fluente','Qi Firme','Qi Brilhante','Qi Etéreo','Qi Purificado','Qi Completo'] },
  { index: 1,  name: 'Fundação Sólida',       subNames: ['Base Rachada','Base Fraca','Base Estável','Base Sólida','Base Forte','Base de Pedra','Base de Ferro','Base de Jade','Base de Ouro Perfeita'] },
  { index: 2,  name: 'Formação do Núcleo',    subNames: ['Núcleo Nascente','Núcleo Fraco','Núcleo Estável','Núcleo Firme','Núcleo Brilhante','Núcleo Puro','Núcleo de Cristal','Núcleo de Jade','Núcleo Divino'] },
  { index: 3,  name: 'Nascimento do Espírito',subNames: ['Espírito Fragmentado','Espírito Nublado','Espírito Desperto','Espírito Claro','Espírito Firme','Espírito Brilhante','Espírito Etéreo','Espírito Puro','Espírito Ascendido'] },
  { index: 4,  name: 'Transformação Divina',  subNames: ['Transformação Bruta','Transformação Inicial','Transformação Lenta','Transformação Fluente','Transformação Sólida','Transformação Pura','Transformação Avançada','Transformação Suprema','Transformação Plena'] },
  { index: 5,  name: 'União do Dao',           subNames: ['União Imperfeita','União Fragmentada','União Inicial','União Crescente','União Sólida','União Avançada','União Refinada','União Suprema','União Total'] },
  { index: 6,  name: 'Tribulação Celestial',  subNames: ['1ª Tribulação','2ª Tribulação','3ª Tribulação','4ª Tribulação','5ª Tribulação','6ª Tribulação','7ª Tribulação','8ª Tribulação','9ª Tribulação'] },
  { index: 7,  name: 'Semi-Imortal',           subNames: ['Imortal do Caminho','Imortal Fraco','Imortal Crescente','Imortal Sólido','Imortal Avançado','Imortal Refinado','Imortal Supremo','Imortal Perfeito','Imortal Absoluto'] },
  { index: 8,  name: 'Imortal Verdadeiro',     subNames: ['Imortal Menor','Imortal Intermediário','Imortal Superior','Imortal Avançado','Imortal do Dao','Imortal Puro','Imortal Divino','Imortal Celestial Menor','Imortal Completo'] },
  { index: 9,  name: 'Imortal Celestial',      subNames: ['Celestial Inicial','Celestial Crescente','Celestial Sólido','Celestial Avançado','Celestial Superior','Celestial Divino','Celestial Supremo','Celestial Quase-Perfeito','Celestial Supremo'] },
  { index: 10, name: 'Soberano do Dao',         subNames: ['Soberano Inicial','Soberano Crescente','Soberano Firme','Soberano Avançado','Soberano Superior','Soberano Divino','Soberano Supremo','Soberano do Caos','Soberano Absoluto'] },
  { index: 11, name: 'Ser Primordial',          subNames: ['Primordial Bruto','Primordial Inicial','Primordial Crescente','Primordial Sólido','Primordial Avançado','Primordial Superior','Primordial Divino','Primordial Supremo','Primordial Completo'] },
  { index: 12, name: 'Além do Dao',             subNames: ['Transcendência I','Transcendência II','Transcendência III','Transcendência IV','Transcendência V','Transcendência VI','Transcendência VII','Transcendência VIII','O Imortal Eterno'] },
];

const BODY_REALMS = [
  { index: 0,  name: 'Refinamento da Carne',   subNames: ['Carne Bruta','Carne Firme','Carne Resistente','Carne Elástica','Carne Dura','Carne de Couro','Carne de Pedra','Carne Reforçada','Carne Purificada'] },
  { index: 1,  name: 'Refinamento dos Ossos',  subNames: ['Ossos Fracos','Ossos Firmes','Ossos Densos','Ossos Sólidos','Ossos de Ferro','Ossos de Aço','Ossos de Jade','Ossos Sagrados','Ossos Purificados'] },
  { index: 2,  name: 'Refinamento dos Tendões',subNames: ['Tendões Rígidos','Tendões Firmes','Tendões Elásticos','Tendões Ágeis','Tendões Velozes','Tendões de Seda','Tendões Sagrados','Tendões Divinos','Tendões Purificados'] },
  { index: 3,  name: 'Purificação do Sangue',  subNames: ['Sangue Bruto','Sangue Circulante','Sangue Aquecido','Sangue Vibrante','Sangue Dourado Menor','Sangue Dourado','Sangue Prateado','Sangue Sagrado','Sangue Purificado'] },
  { index: 4,  name: 'Corpo de Bronze',         subNames: ['Bronze Inicial','Bronze Sólido','Bronze Refinado','Bronze Puro','Bronze Brilhante','Bronze Sagrado','Bronze Divino','Bronze Supremo','Bronze Perfeito'] },
  { index: 5,  name: 'Corpo de Ferro',          subNames: ['Ferro Inicial','Ferro Sólido','Ferro Refinado','Ferro Puro','Ferro Brilhante','Ferro Sagrado','Ferro Divino','Ferro Supremo','Ferro Perfeito'] },
  { index: 6,  name: 'Corpo de Jade',           subNames: ['Jade Inicial','Jade Sólido','Jade Refinado','Jade Puro','Jade Brilhante','Jade Sagrado','Jade Divino','Jade Supremo','Jade Perfeito'] },
  { index: 7,  name: 'Corpo de Diamante',       subNames: ['Diamante Inicial','Diamante Sólido','Diamante Refinado','Diamante Puro','Diamante Brilhante','Diamante Sagrado','Diamante Divino','Diamante Supremo','Diamante Perfeito'] },
  { index: 8,  name: 'Corpo Divino',            subNames: ['Divino Inicial','Divino Crescente','Divino Firme','Divino Avançado','Divino Superior','Divino Refinado','Divino Supremo','Divino Perfeito','Divino Absoluto'] },
  { index: 9,  name: 'Corpo Imortal',           subNames: ['Imortal Bruto','Imortal Inicial','Imortal Crescente','Imortal Sólido','Imortal Avançado','Imortal Refinado','Imortal Supremo','Imortal Perfeito','Imortal Completo'] },
  { index: 10, name: 'Corpo Primordial',         subNames: ['Primordial Bruto','Primordial Inicial','Primordial Crescente','Primordial Sólido','Primordial Avançado','Primordial Refinado','Primordial Supremo','Primordial Perfeito','Primordial Completo'] },
  { index: 11, name: 'Corpo do Caos',            subNames: ['Caos Bruto','Caos Inicial','Caos Crescente','Caos Sólido','Caos Avançado','Caos Refinado','Caos Supremo','Caos Perfeito','Caos Completo'] },
  { index: 12, name: 'Corpo Absoluto',           subNames: ['Absoluto I','Absoluto II','Absoluto III','Absoluto IV','Absoluto V','Absoluto VI','Absoluto VII','Absoluto VIII','O Corpo Eterno'] },
];

const MIND_REALMS = [
  { index: 0,  name: 'Mente Desperta',          subNames: ['Mente Sonolenta','Mente Alerta','Mente Focada','Mente Calma','Mente Serena','Mente Cristalina','Mente Pura','Mente Elevada','Mente Desperta Completa'] },
  { index: 1,  name: 'Sentidos Aguçados',        subNames: ['Sentidos Brutos','Sentidos Ativos','Sentidos Firmes','Sentidos Afinados','Sentidos Claros','Sentidos Elevados','Sentidos Divinos','Sentidos Supremos','Sentidos Perfeitos'] },
  { index: 2,  name: 'Percepção do Dao',         subNames: ['Percepção Fraca','Percepção Inicial','Percepção Crescente','Percepção Firme','Percepção Avançada','Percepção Superior','Percepção Divina','Percepção Suprema','Percepção do Dao Completa'] },
  { index: 3,  name: 'Visão Espiritual',         subNames: ['Visão Nublada','Visão Inicial','Visão Crescente','Visão Firme','Visão Avançada','Visão Superior','Visão Divina','Visão Suprema','Visão Espiritual Perfeita'] },
  { index: 4,  name: 'Consciência Expandida',    subNames: ['Consciência Bruta','Consciência Inicial','Consciência Crescente','Consciência Firme','Consciência Avançada','Consciência Superior','Consciência Divina','Consciência Suprema','Consciência Plena'] },
  { index: 5,  name: 'Mente do Vazio',           subNames: ['Vazio Inicial','Vazio Crescente','Vazio Firme','Vazio Avançado','Vazio Superior','Vazio Refinado','Vazio Divino','Vazio Supremo','Vazio Completo'] },
  { index: 6,  name: 'Espírito Eterno',          subNames: ['Eterno Inicial','Eterno Crescente','Eterno Firme','Eterno Avançado','Eterno Superior','Eterno Refinado','Eterno Divino','Eterno Supremo','Eterno Completo'] },
  { index: 7,  name: 'Mente Imortal',            subNames: ['Imortal Inicial','Imortal Crescente','Imortal Firme','Imortal Avançado','Imortal Superior','Imortal Refinado','Imortal Divino','Imortal Supremo','Imortal Completo'] },
  { index: 8,  name: 'Consciência Primordial',   subNames: ['Primordial Inicial','Primordial Crescente','Primordial Firme','Primordial Avançado','Primordial Superior','Primordial Refinado','Primordial Divino','Primordial Supremo','Primordial Completo'] },
  { index: 9,  name: 'Mente do Caos',            subNames: ['Caos Inicial','Caos Crescente','Caos Firme','Caos Avançado','Caos Superior','Caos Refinado','Caos Divino','Caos Supremo','Caos Completo'] },
  { index: 10, name: 'Espírito Absoluto',         subNames: ['Absoluto I','Absoluto II','Absoluto III','Absoluto IV','Absoluto V','Absoluto VI','Absoluto VII','Absoluto VIII','Espírito Absoluto Perfeito'] },
  { index: 11, name: 'Mente do Dao',              subNames: ['Dao Inicial','Dao Crescente','Dao Firme','Dao Avançado','Dao Superior','Dao Refinado','Dao Divino','Dao Supremo','Dao Completo'] },
  { index: 12, name: 'Consciência Universal',     subNames: ['Universal I','Universal II','Universal III','Universal IV','Universal V','Universal VI','Universal VII','Universal VIII','A Mente do Criador'] },
];

function getRealmName(realmIndex, subLevel, type = 'qi') {
  const list = type === 'qi' ? QI_REALMS : type === 'body' ? BODY_REALMS : MIND_REALMS;
  const realm = list[realmIndex];
  if (!realm) return 'Desconhecido';
  return `${realm.name} — ${realm.subNames[subLevel - 1] || subLevel}º Nível`;
}

module.exports = { QI_REALMS, BODY_REALMS, MIND_REALMS, getRealmName };
