const { Command } = require('discord.js-commando');
const Discord = require('discord.js');
const fs = require('fs');
const rng = require('random-world');


module.exports = class SettingsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setname',
            group: 'util',
            guildOnly: true,
            memberName: 'setname',
            description: 'Set a new PetBot username.',
            aliases: ['sn'],
          });
    }

run(message, args) {

    args = message.content.split(' ').slice(1);

	  let UserID = message.author.id;
    let allowedRegex = new RegExp("(\p{L})*");
    let newName = args[0];
    var MasterUser = JSON.parse(fs.readFileSync("./PetBot/settings/user/master.json"));

    if(!registeredUser(MasterUser, UserID)){
      MasterUser[UserID] = {};
    }

    if(!allowedRegex.test(newName)){
      message.channel.send("Invalid name: Your name may only contain Unicode characters considered as letters.");
      return;
    }

	if(!!newName == false){
      message.channel.send("Your name cannot be empty. If it isn't empty, an unexpected error may have occured.");
      return;
    }

    if(newName.length >= 64){
      message.channel.send("Your name can only have a maximum of 64 characters.");
      return;
    }

    
    MasterUser[UserID].Name = newName;
    message.channel.send("Your name has been saved succesfully!");
    SaveJSON(MasterUser, "./PetBot/settings/user/master.json");

    registerToServer(UserID, message.guild.id);


  }
}


function getRandom(min, max) {
    return rng.integer({min, max});
  }

function registeredUser(MasterUser, UserID){
  return !!MasterUser[UserID] == true;
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

function registerToServer(UserID, GuildID){
  let GuildSettings = JSON.parse(fs.readFileSync("./PetBot/settings/user/serverlist.json"));
  if(!!GuildSettings[GuildID] == false){
    GuildSettings[GuildID] = [];
  }
  if(!GuildSettings[GuildID].includes(UserID)){
    GuildSettings[GuildID].push(UserID);
  }
  SaveJSON(GuildSettings,"./PetBot/settings/user/serverlist.json");
}
