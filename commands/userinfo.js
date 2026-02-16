const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { DEFAULT_COLOR, FOOTER } = require('../utils/theme');

module.exports = {
  name: 'userinfo',
  description: 'Get information about yourself or another user',
  usage: '[user]',
  args: false,
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get information about yourself or another user')
    .addUserOption((opt) => opt.setName('user').setDescription('User to look up').setRequired(false)),

  async execute(context, client, args) {
    const isInteraction = context?.isChatInputCommand && typeof context.isChatInputCommand === 'function' && context.isChatInputCommand();

    if (isInteraction) {
      const interaction = context;
      const user = interaction.options.getUser('user') || interaction.user;
      const member = interaction.guild ? (interaction.options.getMember('user') || interaction.guild.members.cache.get(user.id)) : null;

      const badges = (user.flags && typeof user.flags.toArray === 'function') ? user.flags.toArray().join(', ') : 'None';

      const embed = new EmbedBuilder()
        .setTitle(`${user.tag}`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setColor(DEFAULT_COLOR)
        .addFields(
          { name: 'ID', value: user.id, inline: true },
          { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true },
          { name: 'Server Join Date', value: member ? member.joinedAt.toDateString() : 'Unknown', inline: true },
          { name: 'Created', value: user.createdAt.toDateString(), inline: true },
          { name: 'Avatar', value: `[Link](${user.displayAvatarURL({ dynamic: true, size: 1024 })})`, inline: true },
          { name: 'Profile', value: `[Discord Profile](https://discord.com/users/${user.id})`, inline: true },
          { name: 'Nickname', value: member?.nickname || 'None', inline: true },
          { name: 'Activity', value: member?.presence?.activities?.[0]?.name || 'None', inline: true }
        )
        .setFooter({ text: FOOTER });

      await interaction.reply({ embeds: [embed] });
      return;
    }

    // Message-based
    const message = context;
    let user;

    if (args && args.length > 0) {
      const mention = message.mentions.users.first();
      if (mention) {
        user = mention;
      } else {
        user = client.users.cache.get(args[0]);
      }
    }

    if (!user) user = message.author;

    const badges = (user.flags && typeof user.flags.toArray === 'function') ? user.flags.toArray().join(', ') : 'None';

    const embed = new EmbedBuilder()
      .setTitle(`${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setColor(DEFAULT_COLOR)
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true },
        { name: 'Server Join Date', value: message.member ? message.member.joinedAt.toDateString() : 'Unknown', inline: true },
        { name: 'Created', value: user.createdAt.toDateString(), inline: true },
        { name: 'Avatar', value: `[Link](${user.displayAvatarURL({ dynamic: true, size: 1024 })})`, inline: true },
        { name: 'Profile', value: `[Discord Profile](https://discord.com/users/${user.id})`, inline: true },
        { name: 'Nickname', value: message.member?.nickname || 'None', inline: true },
        { name: 'Activity', value: message.member?.presence?.activities?.[0]?.name || 'None', inline: true }
      )
      .setFooter({ text: FOOTER });

    message.reply({ embeds: [embed] });
  }
}; 
