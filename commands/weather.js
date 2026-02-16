const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const weatherClient = require('../utils/weatherClient');
const { DEFAULT_COLOR, FOOTER } = require('../utils/theme');

const DEFAULT_UNITS = process.env.DEFAULT_WEATHER_UNITS || 'imperial'; // user chose imperial by default

module.exports = {
  name: 'weather',
  description: 'Get current weather for a location',
  usage: "<location> [units: metric|imperial]",
  args: true,
  data: new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Get current weather for a location')
    .addStringOption((opt) => opt.setName('location').setDescription('City name, zip code, or lat,lon').setRequired(true))
    .addStringOption((opt) => opt.setName('units').setDescription('Units (optional)').addChoices(
      { name: 'Imperial (°F)', value: 'imperial' },
      { name: 'Metric (°C)', value: 'metric' }
    )),

  async execute(context, client, args) {
    const isInteraction = context?.isChatInputCommand && typeof context.isChatInputCommand === 'function' && context.isChatInputCommand();

    // Parse inputs
    let location, units;
    if (isInteraction) {
      location = context.options.getString('location');
      units = context.options.getString('units') || DEFAULT_UNITS;
    } else {
      const message = context;
      if (!args || args.length === 0) {
        return message.reply('Usage: `!weather <location> [metric|imperial]`');
      }

      // If last arg looks like a unit, treat it as such
      const maybeUnit = args[args.length - 1].toLowerCase();
      if (['metric', 'imperial', 'c', 'f'].includes(maybeUnit)) {
        if (maybeUnit === 'c') units = 'metric';
        else if (maybeUnit === 'f') units = 'imperial';
        else units = maybeUnit;
        args = args.slice(0, -1);
      } else {
        units = DEFAULT_UNITS;
      }

      location = args.join(' ');
    }

    // Normalize units
    units = (units === 'c') ? 'metric' : (units === 'f' ? 'imperial' : units);
    if (!['metric', 'imperial', 'standard'].includes(units)) units = DEFAULT_UNITS;

    try {
      const data = await weatherClient.getWeather(location, units);

      const temp = data.main.temp;
      const feels = data.main.feels_like;
      const humidity = data.main.humidity;
      const wind = data.wind?.speed ?? 0;
      const weather = data.weather?.[0];
      const iconUrl = weather ? `http://openweathermap.org/img/wn/${weather.icon}@2x.png` : null;

      // Convert temperature to the "other" unit so we always show both
      const tempOther = units === 'metric' ? Math.round(weatherClient.cToF(temp)) : Math.round(weatherClient.fToC(temp));
      const feelsOther = units === 'metric' ? Math.round(weatherClient.cToF(feels)) : Math.round(weatherClient.fToC(feels));
      const mainUnitSymbol = units === 'metric' ? '°C' : '°F';
      const otherUnitSymbol = units === 'metric' ? '°F' : '°C';
      const windUnit = units === 'metric' ? 'm/s' : 'mph';

      const embed = new EmbedBuilder()
        .setTitle(`${data.name}${data.sys?.country ? `, ${data.sys.country}` : ''}`)
        .setDescription(weather?.description?.replace(/(^|\s)\w/g, (c) => c.toUpperCase()) || 'Weather')
        .setColor(DEFAULT_COLOR)
        .setThumbnail(iconUrl)
        .addFields(
          { name: 'Temperature', value: `${Math.round(temp)}${mainUnitSymbol} (${tempOther}${otherUnitSymbol})`, inline: true },
          { name: 'Feels like', value: `${Math.round(feels)}${mainUnitSymbol} (${feelsOther}${otherUnitSymbol})`, inline: true },
          { name: 'Humidity', value: `${humidity}%`, inline: true },
          { name: 'Wind', value: `${wind} ${windUnit}`, inline: true },
          { name: 'Coordinates', value: `${data.coord.lat.toFixed(4)}, ${data.coord.lon.toFixed(4)}`, inline: true },
          { name: 'Source', value: 'OpenWeatherMap', inline: true }
        )
        .setFooter({ text: FOOTER })
        .setTimestamp();

      if (isInteraction) return context.reply({ embeds: [embed] });
      return context.reply({ embeds: [embed] });
    } catch (err) {
      console.error('weather command error:', err?.message || err);
      const msg = (err && err.code === 'NO_API_KEY') ? 'Weather API key not configured — set `OPENWEATHER_KEY` in .env' : `Could not find weather for **${location}**.`;
      if (isInteraction) return context.reply({ content: `❌ ${msg}`, ephemeral: true });
      return context.reply(`❌ ${msg}`);
    }
  },
};