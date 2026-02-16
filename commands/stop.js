const { EmbedBuilder } = require('discord.js');
const { DEFAULT_COLOR, ERROR_COLOR, FOOTER } = require('../utils/theme');

module.exports = {
  name: 'stop',
  description: 'Shut down the bot (owner only)',
  execute(message, client) {
    const ownerId = process.env.OWNER_ID || '0x7694C9';
    if (message.author.id !== ownerId) {
      return message.reply({ embeds: [new EmbedBuilder().setTitle('Permission denied').setDescription('You do not have permission to use this command.').setColor(ERROR_COLOR).setFooter({ text: FOOTER })] });
    }

    const embed = new EmbedBuilder().setTitle('Shutting down...').setColor(DEFAULT_COLOR).setFooter({ text: FOOTER });
    message.reply({ embeds: [embed] }).then(() => {
      client.destroy();
      process.exit(0);
    });
  }
}