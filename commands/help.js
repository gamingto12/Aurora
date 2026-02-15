module.exports = {
  name: 'help',
  description: 'Shows all available commands',
  execute(message, client, args, commands) {
    const helpText = `
**Available Commands:**
${Array.from(commands.values())
  .map((cmd) => `\`!${cmd.name}${cmd.usage ? ` ${cmd.usage}` : ''}\` - ${cmd.description}`)
  .join('\n')}
    `;
    message.reply(helpText);
  },
};
