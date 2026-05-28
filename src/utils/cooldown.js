// Verifica e retorna tempo restante de cooldown em texto legível
function getCooldownRemaining(lastUsed, cooldownMs) {
  if (!lastUsed) return 0;
  const elapsed = Date.now() - new Date(lastUsed).getTime();
  const remaining = cooldownMs - elapsed;
  return remaining > 0 ? remaining : 0;
}

function formatCooldown(ms) {
  if (ms <= 0) return null;
  const totalSeconds = Math.ceil(ms / 1000);
  const hours   = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0)   return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

module.exports = { getCooldownRemaining, formatCooldown };
