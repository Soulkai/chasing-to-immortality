import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import P from 'pino'
import qrcode from 'qrcode-terminal'
import { env } from '../config/env.js'
import { routeMessage } from '../commands/router.js'

export async function startBot(): Promise<void> {
  const logger = P({ level: env.logLevel })
  const { state, saveCreds } = await useMultiFileAuthState(env.authDir)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    browser: Browsers.ubuntu('Ascensao Imortal'),
    printQRInTerminal: !env.loginPhoneNumber,
    logger
  })

  if (env.loginPhoneNumber && !state.creds.registered) {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(env.loginPhoneNumber)
        console.log('\n========================================')
        console.log('Código de pareamento do WhatsApp:')
        console.log(code)
        console.log('Use no celular em: Aparelhos conectados > Conectar com número de telefone')
        console.log('========================================\n')
      } catch (error) {
        logger.error({ error }, 'Falha ao gerar código de pareamento. Tente novamente ou use QR.')
      }
    }, 3000)
  }

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr && !env.loginPhoneNumber) {
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      logger.info('Bot conectado ao WhatsApp.')
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as Boom | undefined)?.output?.statusCode
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut
      logger.warn({ statusCode, shouldReconnect }, 'Conexão fechada.')
      if (shouldReconnect) await startBot()
      else logger.error('Sessão encerrada. Apague a pasta auth e faça login novamente.')
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const message of messages) {
      try {
        await routeMessage(sock, message)
      } catch (error) {
        logger.error({ error }, 'Erro processando mensagem.')
      }
    }
  })
}
