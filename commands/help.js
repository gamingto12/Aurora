const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { DEFAULT_COLOR, FOOTER } = require('../utils/theme');

module.exports = {
  name: 'help',
  description: 'Shows all available commands',
  data: new SlashCommandBuilder().setName('help').setDescription('Shows all available commands'),

  async execute(context, client, args, commands) {
    const isInteraction = context?.isChatInputCommand && typeof context.isChatInputCommand === 'function' && context.isChatInputCommand();

    const prefixList = Array.from(commands.values()).map((cmd) => `**!${cmd.name}${cmd.usage ? ` ${cmd.usage}` : ''}** — ${cmd.description}`).join('\n');
    const slashList = Array.from(client.slashCommands?.values() || []).map((cmd) => `\t/${cmd.data.name}${cmd.data.options?.length ? ' <options>' : ''} — ${cmd.data.description || ''}`).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('Help — Commands')
      .setColor(DEFAULT_COLOR)
      .setDescription(`${prefixList}\n\n**Slash commands:**\n${slashList}`)
      .setFooter({ text: `${FOOTER} — Use !command or /command to run a command` });

    if (isInteraction) return context.reply({ embeds: [embed], ephemeral: true });
    return context.reply({ embeds: [embed] });
  },
};
