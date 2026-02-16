module.exports = (client) => {
  client.once('ready', () => {
    console.log(`✅ Bot logged in as ${client.user.tag}`);
    client.user.setActivity('all of you', { type: 'WATCHING' });
  });
};
