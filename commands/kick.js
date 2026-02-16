const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { ERROR_COLOR, FOOTER } = require('../utils/theme');

module.exports = {
  name: 'kick',
  description: 'Kick a user from the server (admin only)',
  usage: '<user>',
  args: true,
  async execute(message, client, args) {
    if (!message.guild) {
      return message.reply({ embeds: [new EmbedBuilder().setTitle('Error').setDescription('This command can only be used in a server.').setColor(ERROR_COLOR).setFooter({ text: FOOTER })] });
    }

    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return message.reply({ embeds: [new EmbedBuilder().setTitle('Permission denied').setDescription('You do not have permission to use this command.').setColor(ERROR_COLOR).setFooter({ text: FOOTER })] });
    }

    const user = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
    if (!user) {
      return message.reply({ embeds: [new EmbedBuilder().setTitle('Invalid user').setDescription('Please mention a valid user or provide a valid user ID.').setColor(ERROR_COLOR).setFooter({ text: FOOTER })] });
    }

    const member = message.guild.members.cache.get(user.id);
    if (!member) {
      return message.reply({ embeds: [new EmbedBuilder().setTitle('Not in server').setDescription('That user is not in this server.').setColor(ERROR_COLOR).setFooter({ text: FOOTER })] });
    }

    if (!member.kickable) {
      return message.reply({ embeds: [new EmbedBuilder().setTitle('Cannot kick').setDescription('I cannot kick that user. They may have higher permissions than me or I may not have kick permissions.').setColor(ERROR_COLOR).setFooter({ text: FOOTER })] });
    }

    try {
      await member.kick();
      const embed = new EmbedBuilder()
        .setTitle('User Kicked')
        .setColor(ERROR_COLOR)
        .setDescription(`${user.tag} was kicked`)
        .setFooter({ text: `${FOOTER} • Kicked by ${message.author.tag}` })
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply({ embeds: [new EmbedBuilder().setTitle('Error').setDescription('There was an error trying to kick that user.').setColor(ERROR_COLOR).setFooter({ text: FOOTER })] });
    }
  }
}