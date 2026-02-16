const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { DEFAULT_COLOR, ERROR_COLOR, FOOTER } = require('../utils/theme');

module.exports = {
  name: 'stop',
  description: 'Shut down the bot (owner only)',
  data: new SlashCommandBuilder().setName('stop').setDescription('Shut down the bot (owner only)'),

  async execute(context, client) {
    const isInteraction = context?.isChatInputCommand && typeof context.isChatInputCommand === 'function' && context.isChatInputCommand();
    const authorId = isInteraction ? context.user.id : context.author.id;

    const ownerId = process.env.OWNER_ID || '0x7694C9';
    if (authorId !== ownerId) {
      const embed = new EmbedBuilder().setTitle('Permission denied').setDescription('You do not have permission to use this command.').setColor(ERROR_COLOR).setFooter({ text: FOOTER });
      if (isInteraction) return context.reply({ embeds: [embed], ephemeral: true });
      return context.reply({ embeds: [embed] });
    }

    try {
      const embed = new EmbedBuilder()
        .setTitle('Shutting down...')
        .setDescription('Bye! The bot is shutting down now.')
        .setColor(DEFAULT_COLOR)
        .setFooter({ text: FOOTER });
      
      if (isInteraction) await context.reply({ embeds: [embed], ephemeral: true });
      else await context.reply({ embeds: [embed] });
      
      // Give Discord a moment to process the message, then disconnect
      setTimeout(async () => {
        console.log('Shutting down bot...');
        await (isInteraction ? context.client.destroy() : client.destroy());
        process.exit(0);
      }, 1000);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
} 