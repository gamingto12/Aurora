const { ActivityType, REST, Routes } = require('discord.js');
const slashLoader = require('../utils/slashCommandLoader');

module.exports = (client) => {
  client.once('ready', async () => {
    console.log(`✅ Bot logged in as ${client.user.tag}`);

    // Load slash commands into memory
    const slashCommands = slashLoader(client);

    // Register slash commands with Discord (optional: guild-only during development)
    try {
      const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

      const commandsPayload = Array.from(slashCommands.values()).map((c) => c.data.toJSON());

      if (commandsPayload.length > 0) {
        // For development fast-iteration, register to a single guild using process.env.GUILD_ID
        if (process.env.GUILD_ID) {
          await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID), { body: commandsPayload });
          console.log(`🔁 Registered ${commandsPayload.length} slash command(s) to guild ${process.env.GUILD_ID}`);
        } else {
          await rest.put(Routes.applicationCommands(client.user.id), { body: commandsPayload });
          console.log(`🔁 Registered ${commandsPayload.length} global slash command(s)`);
        }
      }
    } catch (err) {
      console.error('Failed to register slash commands', err);
    }

    // Set bot activity/presence
    client.user.setPresence({
      activities: [{ name: 'Watching all of you', type: ActivityType.Watching }],
      status: 'online'
    });
  });
};
