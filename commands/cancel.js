module.exports = {
  run: async (client, message, args) => {
    try {
      if (!args[0]) {
        return message.reply('Please supply an event join code.');
      }

      let event = await client.db.events.getByJoinCode(args[0]);

      if (!event) {
        return message.reply('Could not find an event with the supplied join code.');
      }

      let fireteamAdmins = await client.db.fireteams.getAdminsByEventId(event.id);

      if (!fireteamAdmins.discord_id.split(',').includes(message.author.id)) {
        return message.reply('Only admins can cancel events.');
      }

      await client.db.events.delete(event.id);
      await client.db.fireteams.delete(event.id);
    
    } catch (err) {
      throw new Error(err);
    }
  },

  help: 'Cancel an event and remove its fireteam.  Requires a valid event join code.  You must be an admin of the event you are trying to cancel.'
};