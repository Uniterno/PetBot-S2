const { Command } = require('discord.js-commando');
const Discord = require('discord.js');
const fs = require('fs');
const rng = require('random-world');


module.exports = class SettingsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'settings',
            group: 'util',
            guildOnly: true,
            memberName: 'settings',
            description: 'Update setting rules.',
            aliases: ['s'],
          });
    }

run(message, args) {

    args = message.content.split(' ').slice(1);

	  let UserID = message.author.id;
  	let DateV = new Date();

  	var MasterUser = JSON.parse(fs.readFileSync("./PetBot/settings/user/master.json"));

    if(!registeredUser(MasterUser[UserID])){
      message.channel.send("I'm sorry! It seems you haven't registered an account yet, to make use of PetBot features you must register first.\nTry using !setname <Your name> to set up your username! This can be changed at any moment!\nUse !pp to read PetBot's Privacy Policy!");
      return;
    }

    let selectedSetting = args[0];
    let value = args[1];
    let settingsFile = JSON.parse(fs.readFileSync("./PetBot/settings/user/settings.json"));

    if(!!settingsFile.default[selectedSetting] == false){
      message.channel.send("This rule doesn't exist!");
      return;
    } else{
      let editedFlag = false;
      if(!!settingsFile[UserID][selectedSetting] == false){
        settingsFile[UserID][selectedSetting] = null;
        editedFlag = true;
      }

      if(!isAuthorized(settingsFile.adminConfiguration[selectedSetting], value)){
        message.channel.send("The parameter you entered is not accepted by the rule ``" + selectedSetting + "``.");
      } else{
        settingsFile[UserID][selectedSetting] = value;
        message.channel.send("This rule has been updated succesfully!");
        editedFlag = true;
      }

      if(editedFlag){
        SaveJSON(settingsFile, "./PetBot/settings/user/settings.json");
      }
    }
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