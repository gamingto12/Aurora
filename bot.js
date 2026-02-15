const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const loadCommands = require('./utils/commandLoader');
const readyEvent = require('./events/ready');
const messageCreateEvent = require('./events/messageCreate');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Load commands
const commands = loadCommands(client);

// Load events
readyEvent(client);
messageCreateEvent(client, commands);

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
