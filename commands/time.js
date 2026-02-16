const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const weatherClient = require('../utils/weatherClient');
const { DEFAULT_COLOR, FOOTER } = require('../utils/theme');

module.exports = {
  name: 'time',
  description: 'Show local time for a location',
  usage: '<location>',
  args: true,
  data: new SlashCommandBuilder()
    .setName('time')
    .setDescription('Show local time for a location')
    .addStringOption((opt) => opt.setName('location').setDescription('City name or lat,lon').setRequired(true)),

  async execute(context, client, args) {
    const isInteraction = context?.isChatInputCommand && typeof context.isChatInputCommand === 'function' && context.isChatInputCommand();

    let location;
    if (isInteraction) {
      location = context.options.getString('location');
    } else {
      if (!args || args.length === 0) return context.reply('Usage: `!time <location>`');
      location = args.join(' ');
    }

    try {
      // reuse weather API to obtain timezone offset (no extra API needed)
      const data = await weatherClient.getWeather(location, 'metric');
      const tzOffset = data.timezone; // seconds offset from UTC
      const localTime = weatherClient.formatLocalTimeFromOffset(tzOffset);
      const offsetLabel = weatherClient.formatOffset(tzOffset);

      const embed = new EmbedBuilder()
        .setTitle(`${data.name}${data.sys?.country ? `, ${data.sys.country}` : ''} — Local Time`)
        .setColor(DEFAULT_COLOR)
        .addFields(
          { name: 'Local time', value: `**${localTime}**`, inline: true },
          { name: 'Timezone', value: `${offsetLabel}`, inline: true },
          { name: 'Coordinates', value: `${data.coord.lat.toFixed(4)}, ${data.coord.lon.toFixed(4)}`, inline: true }
        )
        .setFooter({ text: FOOTER })
        .setTimestamp();

      if (isInteraction) return context.reply({ embeds: [embed] });
      return context.reply({ embeds: [embed] });
    } catch (err) {
      console.error('time command error:', err?.message || err);
      const msg = (err && err.code === 'NO_API_KEY') ? 'Weather API key not configured — set `OPENWEATHER_KEY` in .env' : `Could not determine time for **${location}**.`;
      if (isInteraction) return context.reply({ content: `❌ ${msg}`, ephemeral: true });
      return context.reply(`❌ ${msg}`);
    }
  },
};