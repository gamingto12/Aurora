module.exports = {
  name: 'echo',
  description: 'Echo back what you say',
  args: true,
  usage: '<text>',
  execute(message, client, args) {
    const echoText = args.join(' ');
    message.reply(echoText);
  },
};
