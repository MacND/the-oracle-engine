global.__basedir = __dirname;

const Discord = require('discord.js');
const Enmap = require('enmap');
const fs = require('fs');
const dbpool = require('./utils/createDbPool.js');

const client = new Discord.Client({ disableEveryone: true });
const config = require('./config/discord.json');
client.config = config;
client.dbpool = dbpool;

fs.readdir('./events/', (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split('.')[0];
    client.on(eventName, event.bind(null, client));
  });
});

client.commands = new Enmap();

fs.readdir('./commands/', (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith('.js')) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split('.')[0];
    console.log(`Attempting to load command ${commandName}`);
    client.commands.set(commandName, props);
  });
});

client.login(config.token);
