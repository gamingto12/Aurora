module.exports = {
  name: 'user',
  description: 'Get information about yourself',
  execute(message, client) {
    const userInfo = `
**User Info:**
Name: ${message.author.username}#${message.author.discriminator}
ID: ${message.author.id}
Account created: ${message.author.createdAt.toDateString()}
    `;
    message.reply(userInfo);
  },
};
