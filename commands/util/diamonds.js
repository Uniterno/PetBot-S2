const { Command } = require('discord.js-commando');
const Discord = require('discord.js');
const fs = require('fs');
const rng = require('random-world');


module.exports = class SettingsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'diamonds',
            group: 'util',
            guildOnly: true,
            memberName: 'diamonds',
            description: 'Return amount of Diamonds.',
            aliases: ['dia', 'diamond'],
          });
    }

run(message, args) {
  var MasterUser = JSON.parse(fs.readFileSync("./PetBot/settings/user/master.json"));
  let UserID = message.author.id;
  let Diamonds = MasterUser[UserID].Diamonds;
  message.channel.send("You have " + Diamonds + " Diamonds!");
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