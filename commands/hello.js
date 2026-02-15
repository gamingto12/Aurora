module.exports = {
  name: 'hello',
  description: 'Get a greeting',
  execute(message, client) {
    message.reply(`👋 Hello ${message.author.username}!`);
  },
};
