import 'dotenv/config'

function bool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback
  return ['1', 'true', 'yes', 'sim', 'on'].includes(value.toLowerCase())
}

function csv(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export const env = {
  databaseUrl: process.env.DATABASE_URL ?? '',
  loginPhoneNumber: (process.env.LOGIN_PHONE_NUMBER ?? '').replace(/\D/g, ''),
  adminNumbers: csv(process.env.ADMIN_NUMBERS).map((number) => number.replace(/\D/g, '')),
  prefix: process.env.BOT_PREFIX ?? '!',
  requireGroupActivation: bool(process.env.REQUIRE_GROUP_ACTIVATION, true),
  authDir: process.env.AUTH_DIR ?? 'auth',
  logLevel: process.env.LOG_LEVEL ?? 'info'
}

export function assertEnv(): void {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL não foi configurado. Copie .env.example para .env e ajuste o banco.')
  }

  if (env.adminNumbers.length === 0) {
    throw new Error('ADMIN_NUMBERS precisa ter pelo menos um número.')
  }
}
