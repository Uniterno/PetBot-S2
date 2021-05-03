const { Command } = require('discord.js-commando');
const Discord = require('discord.js');
const fs = require('fs');
const rng = require('random-world');


module.exports = class DailyAttackCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'dailyattackinteractive',
            group: 'util',
            guildOnly: true,
            memberName: 'dailyattackinteractive',
            description: 'Daily Attack Gacha Command (Interactive).',
            aliases: ['dai'],
          });
    }

run(message, args) {

    args = message.content.split(' ').slice(1);

    let UserID = message.author.id;
    let DateV = new Date();

    var MasterUser = JSON.parse(fs.readFileSync("./PetBot/settings/user/master.json"));

    if(!registeredUser(MasterUser, UserID)){
      message.channel.send("I'm sorry! It seems you haven't registered an account yet, to make use of PetBot features you must first register.\nTry using !setname <Your name> to set up your username! This can be changed at any moment!\nUse !pp to read PetBot's Privacy Policy!");
      return;
    }

    //if(MasterUser)

    registerToServer(UserID, message.guild.id);

    var Settings = JSON.parse(fs.readFileSync("./PetBot/settings/master.json"));
    var UserSettings = JSON.parse(fs.readFileSync("./PetBot/settings/user/settings.json"));
    var CurrentBoss = Settings.DailyAttack.CurrentBoss;

    if(!!MasterUser[UserID].DailyAttack == false){
      MasterUser[UserID].DailyAttack = {};
      MasterUser[UserID].DailyAttack.SetCharacter = null;
      MasterUser[UserID].DailyAttack.RemainingStamina = 100;
      MasterUser[UserID].DailyAttack.Inventory = {};
    }
    console.log("test 4");

    restoreStamina(MasterUser, UserID);

    if(!!MasterUser[UserID].DailyAttack.Buffs == false){
      MasterUser[UserID].DailyAttack.Buffs = {
        "AngelsRevelation": {
          "Enabled": false,
          "Ready": false,
          "Inspiration": 8
        }
      }
    }

    if(!!args[1] == false){
      return;
    }

    if(args[0] == "enable"){
      if(args[1].toLowerCase() == "angel" || args[1].toLowerCase() == "angel's" || args[1].toLowerCase() == "angels"){
        console.log(MasterUser[UserID].DailyAttack.SetCharacter);
        if(MasterUser[UserID].DailyAttack.SetCharacter != "AngelRiko"){
          message.channel.send("You need to set Angel Riko as the current character before enabling this ability.");
          return;
        }
        if(MasterUser[UserID].DailyAttack.Inventory.AngelRiko.Level < 10){
          message.channel.send("Angel Riko's skill tier needs to be at least I before using this ability.");
          return;
        }
        if(MasterUser[UserID].DailyAttack.Buffs.AngelsRevelation.Enabled){
          message.channel.send("Angel's Revelation is already enabled.");
        } else{
          MasterUser[UserID].DailyAttack.Buffs.AngelsRevelation.Enabled = true;
          message.channel.send("Angel's Revelation has been enabled.");
        }
      }
    } else if(args[0] == "disable"){
      if(args[1].toLowerCase() == "angel" || args[1].toLowerCase() == "angel's" || args[1].toLowerCase() == "angels"){
        if(MasterUser[UserID].DailyAttack.SetCharacter != "AngelRiko"){
          message.channel.send("You need to set Angel Riko as the current character before disabling this ability.");
          return;
        }
        if(!MasterUser[UserID].DailyAttack.Buffs.AngelsRevelation.Enabled){
          message.channel.send("Angel's Revelation is already disabled.");
        } else{
          MasterUser[UserID].DailyAttack.Buffs.AngelsRevelation.Enabled = false;
          message.channel.send("Angel's Revelation has been disabled.");
        }
      }
    }

    SaveJSON(MasterUser, "./PetBot/settings/user/master.json");
    //SaveJSON(Settings, "./PetBot/settings/master.json");  
 }
}

function registeredUser(MasterUser, UserID){
  return !!MasterUser[UserID] == true;
}

function SaveJSON(Obj, Path){
   let toSave = JSON.stringify(Obj, null, "\t");
   fs.writeFileSync(Path, toSave); 
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

function restoreStamina(MasterUser, UserID){
  let DateV = new Date();
  let fullDaysSinceEpoch = Math.floor(DateV/8.64e7);
  console.log(fullDaysSinceEpoch);
  // let CurrentDate = DateV.getUTCDate() + "/" + (DateV.getUTCMonth()+1) + "/" + DateV.getUTCFullYear();
  console.log(MasterUser[UserID]);
  if(!!MasterUser[UserID].LastDay == false){
    MasterUser[UserID].LastDay = "Never";
  }
  console.log("test 5");
  let LastDay = MasterUser[UserID].LastDay;
  console.log(LastDay);
  if(fullDaysSinceEpoch != LastDay){
    console.log(MasterUser[UserID].DailyAttack);
    MasterUser[UserID].DailyAttack.RemainingStamina += (fullDaysSinceEpoch - LastDay) * 100;
    if(MasterUser[UserID].DailyAttack.RemainingStamina > 700){
      MasterUser[UserID].DailyAttack.RemainingStamina = 700;
    }
  }
  MasterUser[UserID].LastDay = fullDaysSinceEpoch;
  SaveJSON(MasterUser, "./PetBot/settings/user/master.json");
}