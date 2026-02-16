const { ActivityType } = require('discord.js');

module.exports = (client) => {
  client.once('ready', () => {
    console.log(`✅ Bot logged in as ${client.user.tag}`);
    
    // Set bot activity/presence
    client.user.setPresence({
      activities: [{ name: 'Watching all of you', type: ActivityType.Watching }],
      status: 'online'
    });
  });
};
