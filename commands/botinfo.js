const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { DEFAULT_COLOR, FOOTER } = require('../utils/theme');

module.exports = {
  name: 'botinfo',
  description: 'Gets technical information about the bot',
  data: new SlashCommandBuilder().setName('botinfo').setDescription("Gets technical information about the bot"),

  async execute(context, client) {
    const isInteraction = context?.isChatInputCommand && typeof context.isChatInputCommand === 'function' && context.isChatInputCommand();
    const reference = isInteraction ? context : context; // keep naming consistent
    const clientRef = client || (isInteraction ? context.client : undefined);

    const embed = new EmbedBuilder()
      .setTitle('Bot Info')
      .setColor(DEFAULT_COLOR)
      .addFields(
        { name: 'Name', value: `${clientRef.user.tag}`, inline: true },
        { name: 'ID', value: clientRef.user.id, inline: true },
        { name: 'Library', value: `discord.js v${require('discord.js').version}`, inline: true },
        { name: 'Node', value: process.version, inline: true },
        { name: 'Commands', value: `${clientRef.commands?.size ?? 0}`, inline: true },
        { name: 'Latency', value: `${Date.now() - (isInteraction ? context.createdTimestamp : context.createdTimestamp)}ms`, inline: true },
        { name: 'Created', value: clientRef.user.createdAt.toDateString(), inline: true },
        { name: 'Uptime', value: `${Math.floor(clientRef.uptime / 1000 / 60)} minutes`, inline: true },
        { name: 'Developer', value: '0x7694C9', inline: true },
        { name: 'Invite', value: '[Click here](https://discord.com/oauth2/authorize?client_id=1042119280851963914&permissions=1374389659654&integration_type=0&scope=bot)', inline: false },
        { name: 'Repository', value: '[GitHub](https://github.com/0x7694C9/Aurora)', inline: false },
        { name: 'Support Server', value: '[Join here](https://discord.gg/eBV9RsC2BV)', inline: false }
      )
      .setFooter({ text: `${FOOTER} • Created by 0x7694C9` })
      .setTimestamp();

    if (isInteraction) {
      return context.reply({ embeds: [embed] });
    }

    // Message-based
    const message = context;
    message.reply({ embeds: [embed] });
  },
}; 
