const { loadCommands } = require('./commandLoader');
const PREFIX = process.env.PREFIX || '!';

const commands = loadCommands();

async function handleMessage(sock, msg) {
  const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
  if (!body.startsWith(PREFIX)) return;

  const [rawCmd, ...args] = body.slice(PREFIX.length).trim().split(/\s+/);
  const cmd = rawCmd.toLowerCase();

  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const command = commands.get(cmd);
  if (!command) return;

  try {
    await command.execute({ sock, msg, from, sender, args });
  } catch (err) {
    console.error(`Erro no comando ${cmd}:`, err);
    await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao executar esse comando.' });
  }
}

module.exports = { handleMessage };
