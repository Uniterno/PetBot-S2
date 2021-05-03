const { CommandoClient } = require('discord.js-commando');
const path = require('path');
const fs = require('fs');
// const daily = require('./OOP/daily');


const client = new CommandoClient({
    commandPrefix: '!',
    owner: '168389193603612673',
    disableEveryone: true,
    unknownCommandResponse: false
});

client.registry
    // Registers your custom command groups
    .registerGroups([
        ['admin', 'Admin commands / Test / Cutting-edge'],
        ['util', 'Most of the commands'],
    ])

    // Registers all built-in groups, commands, and argument types
    //.registerDefaults()

    // Registers all of your commands in the ./commands/ directory
    .registerCommandsIn(path.join(__dirname, 'commands'));

let Version = "3.3.1 (Season 2)";


client.on('ready', () => {
    console.log('PetBot '+Version+' started!');
    client.user.setActivity('PetBot '+Version, {type: 'STREAMING'});


});

client.on('error', () => {
  console.log("An error has occured. Auto-login started.");
  client.login(token).then(console.log("Login successful.")).catch(console.error);
});


const token = fs.readFileSync("./PetBot/settings/auth/token.bin", 'utf8');
client.login(token);




