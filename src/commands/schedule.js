const db = require(__basedir + '/src/utils/database/db.js');
const moment = require(__basedir + '/src/utils/moment.js');

module.exports = {
  run: async (client, message, args) => {
    const notify = require(__basedir + '/src/utils/notify.js')(client);
    try {
      if (!args[0]) {
        return message.reply('Please supply an event join code.');
      }

      let event = await db.events.getByJoinCode(args[0], message.guild.id);

      if (!event) {
        return message.reply('Unable find an event with the supplied join code.');
      }

      let eventAdmins = await db.fireteams.getAdminsByEventId(event.id);
 
      if (!eventAdmins.discord_id.split(',').includes(message.author.id)) {
        return message.reply('You are not an admin for this event.');
      }

      let suggestion = args.slice(1).join(' ');

      if (!suggestion) {
        return message.reply('No start time supplied.');
      }

      let user = await db.users.getByDiscordId(message.author.id);
      let suggestedDateTime = moment(suggestion, ['MMM DD HH:mm', 'MMM DD h:mma', 'dddd HH:mm', 'dddd h:mma', 'ddd HH:mm', 'ddd h:mma', 'dddd ha', 'ddd ha',  'HH:mm', 'h:mma', 'ha']);
      
      if (!suggestedDateTime.isValid()) {
        return message.reply('Invalid date-time format.  Please check `!help schedule` to see suitable formats.');
      }
      
      let offset = moment.tz(suggestedDateTime, user.timezone).utcOffset();
      suggestedDateTime.utcOffset(offset, true);
      
      if (suggestedDateTime < moment().tz(user.timezone)) {
        suggestedDateTime.add(7, 'd');
      }

      console.log(suggestedDateTime.utc().format());

      await db.events.putStartTime(suggestedDateTime.utc().format('YYYY-MM-DD HH:mm'), event.id);
      let fireteam = await db.fireteams.getByEventId(event.id);
      notify.pingUsers(fireteam.discord_id.split(','), `${event.join_code} has now been scheduled for ${suggestedDateTime.utc().format('MMMM Do [@] HH:mm z')}.`);
      notify.pingUsersBeforeEvent(fireteam.discord_id.split(','), `In 10 minutes you are scheduled to take part in **${event.join_code}**.  Please proceed to orbit and join up with your fireteam.`, suggestedDateTime.utc(), event.join_code);
      message.reply(`${event.join_code} has now been scheduled for ${moment(suggestedDateTime).tz(user.timezone).format('MMMM Do [@] HH:mm z')}.`);
    } catch (err) {
      throw new Error(err);
    }
  },

  help: 'Set a start time for an event.  Specifiy a join code, and a start time in one of the following formats: ```\nJanuary 1 9:00am\nJanuary 1 09:00\nMonday 09:00\nMonday 9:00am\nMon 09:00\nMon 9:00am\nMonday 9am\nMon 9am\n09:00\n9:00am\n9am```'
};
