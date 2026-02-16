const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { ERROR_COLOR, FOOTER } = require('../utils/theme');

module.exports ={
  name: 'ban',
  description: 'Ban a user from the server (admin only)',
  usage: '<user> [reason]',
  args: true,
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server (admin only)')
    .addUserOption((opt) => opt.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason for the ban')),

  async execute(context, client, args) {
    const isInteraction = context?.isChatInputCommand && typeof context.isChatInputCommand === 'function' && context.isChatInputCommand();

    if (isInteraction) {
      const interaction = context;
      if (!interaction.inGuild()) return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
      if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        const embed = new EmbedBuilder().setTitle('Permission denied').setDescription('You do not have permission to use this command.').setColor(ERROR_COLOR).setFooter({ text: FOOTER });
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const user = interaction.options.getUser('user');
      if (!user) {
        const embed = new EmbedBuilder().setTitle('Invalid user').setDescription('Please provide a valid user to ban.').setColor(ERROR_COLOR).setFooter({ text: FOOTER });
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const reason = interaction.options.getString('reason') || 'No reason provided';
      try {
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!member) {
          const embed = new EmbedBuilder().setTitle('Not a member').setDescription('The specified user is not a member of this server.').setColor(ERROR_COLOR).setFooter({ text: FOOTER });
          return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        await member.ban({ reason });
        const embed = new EmbedBuilder()
          .setTitle('User Banned')
          .setColor(ERROR_COLOR)
          .setDescription(`${user.tag} has been banned`)
          .addFields({ name: 'Reason', value: reason })
          .setFooter({ text: `${FOOTER} • Banned by ${interaction.user.tag}` })
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error(error);
        const embed = new EmbedBuilder().setTitle('Error').setDescription('There was an error trying to ban this user.').setColor(ERROR_COLOR).setFooter({ text: FOOTER });
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

    const user = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
    if (!user) {
      return message.reply({ embeds: [new EmbedBuilder().setTitle('Invalid user').setDescription('Please mention a valid user or provide a valid user ID to ban.').setColor(ERROR_COLOR).setFooter({ text: FOOTER })] });
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';
    try {
      const member = await message.guild.members.fetch(user.id).catch(() => null);
      if (!member) {
        return message.reply({ embeds: [new EmbedBuilder().setTitle('Not a member').setDescription('The specified user is not a member of this server.').setColor(ERROR_COLOR).setFooter({ text: FOOTER })] });
      }

      await member.ban({ reason });
      const embed = new EmbedBuilder()
        .setTitle('User Banned')
        .setColor(ERROR_COLOR)
        .setDescription(`${user.tag} has been banned`)
        .addFields({ name: 'Reason', value: reason })
        .setFooter({ text: `${FOOTER} • Banned by ${message.author.tag}` })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply({ embeds: [new EmbedBuilder().setTitle('Error').setDescription('There was an error trying to ban this user.').setColor(ERROR_COLOR).setFooter({ text: FOOTER })] });
    }
  }
} 