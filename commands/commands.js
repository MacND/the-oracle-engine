const Discord = require("discord.js");
const google = require('../google/google.js');
const config = require("./config.json");
const client = new Discord.Client({ disableEveryone: true });
client.login(config.token);
const moment = require('moment-timezone');
const momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);
typeof moment.duration.fn.format === "function";
typeof moment.duration.format === "function";
moment.locale('en-gb');

module.exports = {
    client,
    config,

    info: async (message) => {
        try {
            message.channel.send(`The Oracle Engine - <https://github.com/macnd/the-oracle-engine>`);
        } catch (err) {
            throw new Error(err);
        }
    },

    raidinfo: async (message, args, activities) => {
        try {
            if (!args[0]) {
                message.channel.send(`Available raids: ${activities.map(function (elem) { return elem.shortName }).join(", ")}.`);
                message.channel.stopTyping();
                return;
            }

            let activity = activities.find(o => o.shortName == args[0].toLowerCase());

            if (!activity) {
                message.channel.send(`Couldn't find an activity with raidId ${args[0]}`);
                message.channel.stopTyping();
                return;
            }

            let embed = new Discord.RichEmbed()
                .setTitle(`${activity.name} (${activity.type})`)
                .setColor(5517157)
                .setDescription(`*"${activity.tagline}"*\n${activity.description}\n\`\`\`Short code: ${activity.shortName}\nRecommended power: ${activity.recommendedPower}\nBeginner estimate: ${moment().startOf('day').seconds(activity.beginnerEstimate).format('H:mm')}\n\`\`\``)
                .setURL(`${activity.wikiUrl}`)
                .setThumbnail(`https://gamezone.cool/img/${activity.shortName}.png`)
                .setFooter(`Gather your Fireteam - !make ${activity.shortName}`)

            message.channel.send(embed);
        } catch (err) {
            throw new Error(err);
        }
    },

    userinfo: async (message, args, registeredUsers) => {
        try {
            let searchUserId = (args[0] ? client.users.find(user => user.username.toLowerCase() === args[0].toLowerCase()).id : message.author.id);
            let user = registeredUsers.find(o => o.discordId === searchUserId);

            if (!user) {
                message.channel.send(`${client.users.get(searchUserId).username} is not registered.`);
                message.channel.stopTyping();
                return;
            }

            message.channel.send(`User information for ${client.users.get(searchUserId).username}:\`\`\`BNet ID: ${user.bnetId}\nTimezone: ${user.timezone}\nTwitch: ${(user.twitch ? user.twitch : 'Not set')}\nNotifications: ${(user.newEventNotification ? 'On' : 'Off')}\`\`\``);
        } catch (err) {
            throw new Error(err);
        }
    },

    sheet: async (message, registeredUsers) => {
        try {
            let user = registeredUsers.find(o => o.discordId === message.author.id);

            if (!user) {
                message.reply('unable to find user - have you registered?');
                message.channel.stopTyping();
                return;
            }

            client.users.get(user.discordId).send(`Your GSheet can be found at https://docs.google.com/spreadsheets/d/${user.gsheeturl}`);
            message.react("✅");

        } catch (err) {
            throw new Error(err);
        }
    }
} 