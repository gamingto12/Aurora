const { EmbedBuilder } = require('discord.js');
const { DEFAULT_COLOR, ERROR_COLOR, FOOTER } = require('../utils/theme');

module.exports = {
  name: 'serverinfo',
  description: 'Get information about the server',
  async execute(message) {
    const { guild } = message;
    if (!guild) {
      const err = new EmbedBuilder().setTitle('Error').setDescription('This command can only be used inside a server.').setColor(ERROR_COLOR).setFooter({ text: FOOTER });
      message.reply({ embeds: [err] });
      return;
    }

    // Try to fetch invites (may fail if bot lacks MANAGE_GUILD)
    let inviteLink = 'None';
    try {
      const invites = await guild.invites.fetch();
      const firstInvite = invites.first();
      if (firstInvite) inviteLink = `https://discord.gg/${firstInvite.code}`;
    } catch (err) {
      inviteLink = 'Unavailable';
    }

    const embed = new EmbedBuilder()
      .setTitle(`${guild.name} — Server Info`)
      .setThumbnail(guild.iconURL({ size: 128 }))
      .setColor(DEFAULT_COLOR)
      .addFields(
        { name: 'Name', value: guild.name, inline: true },
        { name: 'ID', value: guild.id, inline: true },
        { name: 'Owner ID', value: guild.ownerId || 'Unknown', inline: true },
        { name: 'Members', value: String(guild.memberCount), inline: true },
        { name: 'Channels', value: String(guild.channels.cache.size), inline: true },
        { name: 'Roles', value: String(guild.roles.cache.size), inline: true },
        { name: 'Boost Tier', value: guild.premiumTier ? `Tier ${guild.premiumTier}` : 'None', inline: true },
        { name: 'Boost Count', value: String(guild.premiumSubscriptionCount || 0), inline: true },
        { name: 'Verification', value: String(guild.verificationLevel), inline: true },
        { name: 'Invite', value: inviteLink, inline: false },
        { name: 'Created', value: guild.createdAt.toDateString(), inline: true }
      )
      .setFooter({ text: FOOTER })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
