const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const commands = new Map();
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.set(command.name, command);
  }

  return commands;
};
