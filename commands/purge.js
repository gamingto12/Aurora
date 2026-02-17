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
    .addIntegerOption((opt) => opt.setName('count').setDescription('Number of messages to delete (positive integer)').setRequired(true)),

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
      if (isNaN(deleteCount) || deleteCount < 1 || deleteCount > 10000) {
        const embed = new EmbedBuilder().setTitle('Invalid number').setDescription('Please provide a positive number (up to 10000).').setColor(ERROR_COLOR).setFooter({ text: FOOTER });
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      try {
        const purgeResult = await (async function purgeMessages(channel, count) {
          let remaining = count;
          let lastId = undefined;
          let totalDeleted = 0;
          const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000; // 14 days in ms

          while (remaining > 0) {
            const fetchLimit = Math.min(100, remaining);
            const options = { limit: fetchLimit };
            if (lastId) options.before = lastId;

            const fetched = await channel.messages.fetch(options);
            if (!fetched.size) break;

            // Keep track of oldest message fetched for the next 'before' cursor
            lastId = fetched.last().id;

            // Only messages newer than 14 days can be bulk-deleted
            const deletable = fetched.filter(m => m.createdTimestamp > cutoff);
            if (deletable.size > 0) {
              const deleted = await channel.bulkDelete(deletable, true);
              totalDeleted += deleted.size;
              remaining -= deleted.size;
            }

            // If none of the fetched messages were deletable (all too old), stop
            if (deletable.size === 0) break;

            // If we fetched less than requested, there are no more messages to page through
            if (fetched.size < fetchLimit) break;
          }

          return { totalDeleted, remaining };
        })(interaction.channel, deleteCount);

        const embed = new EmbedBuilder()
          .setTitle('Purge Complete')
          .setColor(ERROR_COLOR)
          .setDescription(`Requested ${deleteCount} — deleted ${purgeResult.totalDeleted} message(s).${purgeResult.remaining > 0 ? ' Some messages may be older than 14 days and could not be bulk-deleted.' : ''}`)
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
    if (isNaN(deleteCount) || deleteCount < 1 || deleteCount > 10000) {
      return message.reply({ embeds: [new EmbedBuilder().setTitle('Invalid number').setDescription('Please provide a positive number (up to 10000).').setColor(ERROR_COLOR).setFooter({ text: FOOTER })] });
    }

    try {
      // Reuse the same purge logic for message-based flow
      const purgeResult = await (async function purgeMessages(channel, count) {
        let remaining = count;
        let lastId = undefined;
        let totalDeleted = 0;
        const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000; // 14 days in ms

        while (remaining > 0) {
          const fetchLimit = Math.min(100, remaining);
          const options = { limit: fetchLimit };
          if (lastId) options.before = lastId;

          const fetched = await channel.messages.fetch(options);
          if (!fetched.size) break;

          lastId = fetched.last().id;
          const deletable = fetched.filter(m => m.createdTimestamp > cutoff);
          if (deletable.size > 0) {
            const deleted = await channel.bulkDelete(deletable, true);
            totalDeleted += deleted.size;
            remaining -= deleted.size;
          }

          if (deletable.size === 0) break;
          if (fetched.size < fetchLimit) break;
        }

        return { totalDeleted, remaining };
      })(message.channel, deleteCount);

      const embed = new EmbedBuilder()
        .setTitle('Purge Complete')
        .setColor(ERROR_COLOR)
        .setDescription(`Requested ${deleteCount} — deleted ${purgeResult.totalDeleted} message(s).${purgeResult.remaining > 0 ? ' Some messages may be older than 14 days and could not be bulk-deleted.' : ''}`)
        .setFooter({ text: FOOTER })
        .setTimestamp();

      message.channel.send({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    } catch (error) {
      console.error(error);
      message.reply({ embeds: [new EmbedBuilder().setTitle('Error').setDescription('There was an error trying to delete messages in this channel.').setColor(ERROR_COLOR).setFooter({ text: FOOTER })] });
    }
  }
} 