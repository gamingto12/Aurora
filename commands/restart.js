const { EmbedBuilder } = require('discord.js');
const { DEFAULT_COLOR, ERROR_COLOR, FOOTER } = require('../utils/theme');

module.exports = {
  name: 'restart',
  description: 'Restart the bot (owner only)',
  async execute(message, client) {
    const ownerId = process.env.OWNER_ID || '0x7694C9';
    if (message.author.id !== ownerId) {
      return message.reply({ embeds: [new EmbedBuilder().setTitle('Permission denied').setDescription('You do not have permission to use this command.').setColor(ERROR_COLOR).setFooter({ text: FOOTER })] });
    }

    try {
      const embed = new EmbedBuilder()
        .setTitle('Restarting...')
        .setDescription('The bot is restarting now.')
        .setColor(DEFAULT_COLOR)
        .setFooter({ text: FOOTER });
      
      await message.reply({ embeds: [embed] });
      
      // Give Discord a moment to process the message, then restart
      setTimeout(async () => {
        console.log('Restarting bot...');
        await client.destroy();
        process.exit(0); // Exit with code 0 signals PM2 to restart
      }, 1000);
    } catch (error) {
      console.error('Error during restart:', error);
      process.exit(1);
    }
  }
}
