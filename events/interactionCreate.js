module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands?.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: '❌ There was an error executing that command.', ephemeral: true });
      } else {
        await interaction.reply({ content: '❌ There was an error executing that command.', ephemeral: true });
      }
    }
  });
};