const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { SUCCESS_COLOR, ERROR_COLOR, FOOTER } = require('../utils/theme');

module.exports = {
  name: 'unban',
  description: 'Unban a user from the server (admin only)',
  usage: '<user>',
  args: true,
  async execute(message, client, args) {
    if (!message.guild) {
      return message.reply({ embeds: [new EmbedBuilder().setTitle('Error').setDescription('This command can only be used in a server.').setColor(ERROR_COLOR).setFooter({ text: FOOTER })] });
    }

    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply({ embeds: [new EmbedBuilder().setTitle('Permission denied').setDescription('You do not have permission to use this command.').setColor(ERROR_COLOR).setFooter({ text: FOOTER })] });
    }

    const userId = args[0].replace(/[<@!>]/g, '');
    try {
      await message.guild.members.unban(userId);
      message.reply({ embeds: [new EmbedBuilder().setTitle('User Unbanned').setColor(SUCCESS_COLOR).setDescription(`Successfully unbanned <@${userId}>.`).setFooter({ text: FOOTER })] });
    } catch (error) {
      console.error(error);
      message.reply({ embeds: [new EmbedBuilder().setTitle('Error').setDescription('There was an error trying to unban that user. Make sure the ID is correct and the user is actually banned.').setColor(ERROR_COLOR).setFooter({ text: FOOTER })] });
    }
  }
}