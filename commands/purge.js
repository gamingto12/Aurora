const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { ERROR_COLOR, FOOTER } = require('../utils/theme');

module.exports = {
  name: 'purge',
  description: 'Delete a specified number of messages (admin only)',
  usage: '<number>',
  args: true,
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete a specified number of messages (admin only)')
    .addIntegerOption((opt) => opt.setName('count').setDescription('Number of messages to delete (1-100)').setRequired(true)),

  async execute(context, client, args) {
    const isInteraction = context?.isChatInputCommand && typeof context.isChatInputCommand === 'function' && context.isChatInputCommand();

    if (isInteraction) {
      const interaction = context;
      if (!interaction.inGuild()) return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });

      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        const embed = new EmbedBuilder().setTitle('Permission denied').setDescription('You do not have permission to use this command.').setColor(ERROR_COLOR).setFooter({ text: FOOTER });
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const deleteCount = interaction.options.getInteger('count');
      if (isNaN(deleteCount) || deleteCount < 1 || deleteCount > 1000000) {
        const embed = new EmbedBuilder().setTitle('Invalid number').setDescription('Please provide a number between 1 and 100.').setColor(ERROR_COLOR).setFooter({ text: FOOTER });
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      try {
        const fetched = await interaction.channel.messages.fetch({ limit: deleteCount });
        const deleted = await interaction.channel.bulkDelete(fetched, true);

        const embed = new EmbedBuilder()
          .setTitle('Purge Complete')
          .setColor(ERROR_COLOR)
          .setDescription(`Deleted ${deleted.size} messages.`)
          .setFooter({ text: FOOTER })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
      } catch (error) {
        console.error(error);
        const embed = new EmbedBuilder().setTitle('Error').setDescription('There was an error trying to delete messages in this channel.').setColor(ERROR_COLOR).setFooter({ text: FOOTER });
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }

    // Message-based flow
    const message = context;
    if (!message.guild) {
      return message.reply({ embeds: [new EmbedBuilder().setTitle('Error').setDescription('This command can only be used in a server.').setColor(ERROR_COLOR).setFooter({ text: FOOTER })] });
    }

    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply({ embeds: [new EmbedBuilder().setTitle('Permission denied').setDescription('You do not have permission to use this command.').setColor(ERROR_COLOR).setFooter({ text: FOOTER })] });
    }

    const deleteCount = parseInt(args[0], 10);
    if (isNaN(deleteCount) || deleteCount < 1 || deleteCount > 100000) {
      return message.reply({ embeds: [new EmbedBuilder().setTitle('Invalid number').setDescription('Please provide a number between 1 and 100 for the number of messages to delete.').setColor(ERROR_COLOR).setFooter({ text: FOOTER })] });
    }

    try {
      const fetched = await message.channel.messages.fetch({ limit: deleteCount });
      const deleted = await message.channel.bulkDelete(fetched, true);

      const embed = new EmbedBuilder()
        .setTitle('Purge Complete')
        .setColor(ERROR_COLOR)
        .setDescription(`Deleted ${deleted.size} messages.`)
        .setFooter({ text: FOOTER })
        .setTimestamp();

      message.channel.send({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    } catch (error) {
      console.error(error);
      message.reply({ embeds: [new EmbedBuilder().setTitle('Error').setDescription('There was an error trying to delete messages in this channel.').setColor(ERROR_COLOR).setFooter({ text: FOOTER })] });
    }
  }
} 