const { EmbedBuilder } = require('discord.js');
const { DEFAULT_COLOR, FOOTER } = require('../utils/theme');

module.exports = {
  name: 'help',
  description: 'Shows all available commands',
  execute(message, client, args, commands) {
    const embed = new EmbedBuilder()
      .setTitle('Help — Commands')
      .setColor(DEFAULT_COLOR)
      .setDescription(
        Array.from(commands.values())
          .map((cmd) => `**!${cmd.name}${cmd.usage ? ` ${cmd.usage}` : ''}** — ${cmd.description}`)
          .join('\n')
      )
      .setFooter({ text: `${FOOTER} — Use !command to run a command` });

    message.reply({ embeds: [embed] });
  },
};
