const { EmbedBuilder } = require('discord.js');
const { DEFAULT_COLOR, FOOTER } = require('../utils/theme');

module.exports = {
  name: 'ping',
  description: 'Shows the bot\'s latency',
  execute(message, client) {
    const latency = Date.now() - message.createdTimestamp;
    const ws = client.ws.ping;
    const embed = new EmbedBuilder()
      .setTitle('Pong! 🏓')
      .setColor(DEFAULT_COLOR)
      .addFields(
        { name: 'Round-trip', value: `${latency}ms`, inline: true },
        { name: 'WebSocket', value: `${ws}ms`, inline: true }
      )
      .setFooter({ text: FOOTER });
    message.reply({ embeds: [embed] });
  },
};
