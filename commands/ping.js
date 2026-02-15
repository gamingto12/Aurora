module.exports = {
  name: 'ping',
  description: 'Shows the bot\'s latency',
  execute(message, client) {
    message.reply(`🏓 Pong! (${client.ws.ping}ms)`);
  },
};
