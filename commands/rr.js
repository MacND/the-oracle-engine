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
      let eventAdmins = await client.db.fireteams.getAdminsByEventId(event.id);
 
      if (!eventAdmins.discord_id.split(',').includes(message.author.id)) {
        return message.reply('You are not an admin for this event.');
      }
      
      await client.db.events.putRaidReport(args[1], event.id);
    } catch (err) {
      throw new Error(err);
    }
  },

  help: 'Associate a raid report URL with an event.'
};