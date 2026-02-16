const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { SUCCESS_COLOR, ERROR_COLOR, FOOTER } = require('../utils/theme');

module.exports = {
  name: 'unban',
  description: 'Unban a user from the server (admin only)',
  usage: '<user>',
  args: true,
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user from the server (admin only)')
    .addStringOption((opt) => opt.setName('userid').setDescription('User ID to unban').setRequired(true)),

  async execute(context, client, args) {
    const isInteraction = context?.isChatInputCommand && typeof context.isChatInputCommand === 'function' && context.isChatInputCommand();

    if (isInteraction) {
      const interaction = context;
      if (!interaction.inGuild()) return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });

      if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        const embed = new EmbedBuilder().setTitle('Permission denied').setDescription('You do not have permission to use this command.').setColor(ERROR_COLOR).setFooter({ text: FOOTER });
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const userId = interaction.options.getString('userid').replace(/[<@!>]/g, '');
      try {
        await interaction.guild.members.unban(userId);
        const embed = new EmbedBuilder().setTitle('User Unbanned').setColor(SUCCESS_COLOR).setDescription(`Successfully unbanned <@${userId}>.`).setFooter({ text: FOOTER });
        return interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error(error);
        const embed = new EmbedBuilder().setTitle('Error').setDescription('There was an error trying to unban that user. Make sure the ID is correct and the user is actually banned.').setColor(ERROR_COLOR).setFooter({ text: FOOTER });
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }

    // Message-based flow
    const message = context;
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