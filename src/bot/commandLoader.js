const fs = require('fs');
const path = require('path');

function loadCommands() {
  const commands = new Map();
  const commandsDir = path.join(__dirname, '../commands');

  const categories = fs.readdirSync(commandsDir);
  for (const category of categories) {
    const categoryPath = path.join(commandsDir, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;
    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
      const command = require(path.join(categoryPath, file));
      commands.set(command.name, command);
      if (command.aliases) command.aliases.forEach(a => commands.set(a, command));
    }
  }

  console.log(`✅ ${commands.size} comandos carregados.`);
  return commands;
}

module.exports = { loadCommands };
