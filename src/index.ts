import { assertEnv } from './config/env.js'
import { startBot } from './bot/connection.js'

assertEnv()
startBot().catch((error) => {
  console.error('Erro fatal ao iniciar o bot:', error)
  process.exit(1)
})
