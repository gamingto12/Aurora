const { EmbedBuilder } = require('discord.js');
const { DEFAULT_COLOR, FOOTER } = require('../utils/theme');

module.exports = {
  name: 'uptime',
  description: 'Shows how long the bot has been online (in a human-readable format)',
  execute(message, client) {
    const uptime = client.uptime || 0;
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
    const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const embed = new EmbedBuilder()
      .setTitle('Uptime')
      .setColor(DEFAULT_COLOR)
      .setDescription(`I have been online for **${uptimeString}**.`)
      .setFooter({ text: FOOTER })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
}