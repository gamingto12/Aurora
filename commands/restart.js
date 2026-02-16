const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { DEFAULT_COLOR, ERROR_COLOR, FOOTER } = require('../utils/theme');
const { spawn } = require('child_process');

module.exports = {
  name: 'restart',
  description: 'Restart the bot (owner only)',
  data: new SlashCommandBuilder().setName('restart').setDescription('Restart the bot (owner only)'),

  async execute(context, client) {
    const isInteraction = context?.isChatInputCommand && typeof context.isChatInputCommand === 'function' && context.isChatInputCommand();
    const authorId = isInteraction ? context.user.id : context.author.id;

    const ownerId = process.env.OWNER_ID || '0x7694C9';
    if (authorId !== ownerId) {
      const replyTarget = isInteraction ? context : context;
      const embed = new EmbedBuilder().setTitle('Permission denied').setDescription('You do not have permission to use this command.').setColor(ERROR_COLOR).setFooter({ text: FOOTER });
      if (isInteraction) return context.reply({ embeds: [embed], ephemeral: true });
      return context.reply({ embeds: [embed] });
    }

    try {
      const embed = new EmbedBuilder()
        .setTitle('Restarting...')
        .setDescription('The bot is restarting now.')
        .setColor(DEFAULT_COLOR)
        .setFooter({ text: FOOTER });
      
      if (isInteraction) await context.reply({ embeds: [embed], ephemeral: true });
      else await context.reply({ embeds: [embed] });
      
      // Give Discord a moment to process the message, then restart
      setTimeout(async () => {
        console.log('Restarting bot...');
        
        // Spawn a new bot process before exiting
        spawn('node', ['bot.js'], {
          detached: true,
          stdio: 'inherit'
        }).unref();
        
        // Disconnect and exit the current process
        await (isInteraction ? context.client.destroy() : client.destroy());
        process.exit(0);
      }, 1000);
    } catch (error) {
      console.error('Error during restart:', error);
      const embed = new EmbedBuilder().setTitle('Error').setDescription(`Restart failed: ${error.message}`).setColor(ERROR_COLOR).setFooter({ text: FOOTER });
      if (isInteraction) return context.reply({ embeds: [embed], ephemeral: true });
      return context.reply({ embeds: [embed] });
    }
  }
} 
