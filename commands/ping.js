const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { DEFAULT_COLOR, FOOTER } = require('../utils/theme');

module.exports = {
  name: 'ping',
  description: 'Shows the bot\'s latency',
  data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong and latency'),

  async execute(context, client) {
    const isInteraction = context?.isChatInputCommand && typeof context.isChatInputCommand === 'function' && context.isChatInputCommand();

    if (isInteraction) {
      const interaction = context;
      const sent = await interaction.reply({ content: 'Pong! Calculating...', fetchReply: true });
      const latency = sent.createdTimestamp - interaction.createdTimestamp;
      await interaction.editReply(`🏓 Pong! API Latency: ${Math.round(interaction.client.ws.ping)}ms | Message latency: ${latency}ms`);
      return;
    }

    // Message-based
    const message = context;
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
