export function makeBar(current: number, max: number, length = 10): string {
  const safeMax = Math.max(1, max)
  const safeCurrent = Math.max(0, Math.min(current, safeMax))
  const filled = Math.round((safeCurrent / safeMax) * length)
  const empty = Math.max(0, length - filled)
  return `${'█'.repeat(filled)}${'░'.repeat(empty)} ${safeCurrent}/${safeMax}`
}
