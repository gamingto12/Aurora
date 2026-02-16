const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const slashCommands = new Map();
  const mainCommandsPath = path.join(__dirname, '..', 'commands');
  const slashPath = path.join(__dirname, '..', 'commands', 'slash');

  // Load hybrid slash `data` exports from main commands folder first
  if (fs.existsSync(mainCommandsPath)) {
    const files = fs.readdirSync(mainCommandsPath).filter((f) => f.endsWith('.js'));
    for (const file of files) {
      const filePath = path.join(mainCommandsPath, file);
      const command = require(filePath);
      if (command && command.data && command.execute) {
        slashCommands.set(command.data.name, command);
      }
    }
  }

  // Load explicit slash commands from commands/slash only if not already present
  if (fs.existsSync(slashPath)) {
    const files = fs.readdirSync(slashPath).filter((f) => f.endsWith('.js'));
    for (const file of files) {
      const filePath = path.join(slashPath, file);
      const command = require(filePath);
      if (!command || !command.data || !command.execute) continue;
      if (slashCommands.has(command.data.name)) continue;
      slashCommands.set(command.data.name, command);
    }
  }

  client.slashCommands = slashCommands;
  return slashCommands;
};