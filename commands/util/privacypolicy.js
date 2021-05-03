const { Command } = require('discord.js-commando');
const Discord = require('discord.js');
const fs = require('fs');

module.exports = class GDPRCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'pp',
            group: 'util',
            guildOnly: true,
            memberName: 'pp',
            description: 'Privacy Policy.',
            examples: [''],
            throttling: {
        usages: 4,
        duration: 50
    },
        });
    }

   run(message, args) {
    let PrivacyPolicy = fs.readFileSync("./PetBot/settings/legal/privacy.txt", 'utf8');
    message.channel.send(PrivacyPolicy);
    PrivacyPolicy = fs.readFileSync("./PetBot/settings/legal/privacy2.txt", 'utf8');
    message.channel.send(PrivacyPolicy);
    }
  }