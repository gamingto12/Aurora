const PREFIX = '!';

module.exports = (client, commands) => {
  client.on('messageCreate', (message) => {
    // Ignore messages from bots
    if (message.author.bot) return;

    // Check if message starts with prefix
    if (!message.content.startsWith(PREFIX)) return;

    // Extract command and arguments
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Get command from collection
    const command = commands.get(commandName);

    if (!command) return;

    // Check if command requires arguments
    if (command.args && args.length === 0) {
      message.reply(`❌ This command requires arguments!\nUsage: \`!${commandName} ${command.usage}\``);
      return;
    }

    try {
      command.execute(message, client, args, commands);
    } catch (error) {
      console.error(error);
      message.reply('❌ There was an error executing that command!');
    }
  });
};
