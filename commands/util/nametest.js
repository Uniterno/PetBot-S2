const { Command } = require('discord.js-commando');
const Discord = require('discord.js');
const fs = require('fs');
const rng = require('random-world');


module.exports = class SettingsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'nametest',
            group: 'util',
            guildOnly: true,
            memberName: 'nametest',
            description: 'Update setting rules.',
            aliases: ['nt'],
          });
    }

run(message, args) {

    message.channel.send(rng.word());
  }
}


function getRandom(min, max) {
    return rng.integer({min, max});
  }

function registeredUser(MasterUser, UserID){
  return !!MasterUser[UserID] == false;
}

function SaveJSON(Obj, Path){
   let toSave = JSON.stringify(Obj, null, "\t");
   fs.writeFileSync(Path, toSave); 
}

function isAuthorized(adminRule, value){
  for(let i = 0; i < adminRule.length; i++){
    if(adminRule[i] == "system"){
          return false;
    } else if(adminRule[i] == "bool"){
            if(value == "true" || value == "false"){
              return true;
            }
        }
    }
  return false;
}