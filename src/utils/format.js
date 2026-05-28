// Formata moedas
function formatCurrency(copper) {
  const silver = Math.floor(copper / 100);
  const remainCopper = copper % 100;
  const jade = Math.floor(silver / 100);
  const remainSilver = silver % 100;
  let parts = [];
  if (jade > 0)         parts.push(`${jade} 💚 Jade`);
  if (remainSilver > 0) parts.push(`${remainSilver} 🥈 Prata`);
  if (remainCopper > 0 || parts.length === 0) parts.push(`${remainCopper} 🥉 Cobre`);
  return parts.join(' ');
}

// Formata raridade com emoji
function rarityEmoji(rarity) {
  const map = {
    vulgar: '⚪', common: '🟢', uncommon: '🔵', rare: '🟣',
    epic: '🟡', legendary: '🟠', mythic: '🔴', transcendent: '⭐',
    // equipamentos
    divine: '🟠', primordial: '🔴',
    // reinos
    mortal: '⚪', earth: '🟢', heaven: '🔵', chaos: '🔴',
  };
  return map[rarity] || '⚪';
}

// Barra de progresso ASCII
function progressBar(current, max, length = 10) {
  const filled = Math.round((current / max) * length);
  return '█'.repeat(filled) + '░'.repeat(length - filled);
}

module.exports = { formatCurrency, rarityEmoji, progressBar };
