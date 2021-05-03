const { Command } = require('discord.js-commando');
const Discord = require('discord.js');
const fs = require('fs');
const rng = require('random-world');


module.exports = class FoodCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'food',
            group: 'util',
            guildOnly: true,
            memberName: 'food',
            description: 'Daily Attack Food Command.',
            aliases: ['f'],
          });
    }

run(message, args) {

    args = message.content.split(' ').slice(1);

    let UserID = message.author.id;

    var MasterUser = JSON.parse(fs.readFileSync("./PetBot/settings/user/master.json"));

    if(!registeredUser(MasterUser, UserID)){
      message.channel.send("I'm sorry! It seems you haven't registered an account yet, to make use of PetBot features you must first register.\nTry using !setname <Your name> to set up your username! This can be changed at any moment!\nUse !pp to read PetBot's Privacy Policy!");
      return;
    }
    registerToServer(UserID, message.guild.id);

    if(!!MasterUser[UserID].DailyAttack == false){
      MasterUser[UserID].DailyAttack = {};
      MasterUser[UserID].DailyAttack.SetCharacter = null;
      MasterUser[UserID].DailyAttack.RemainingStamina = 100;
      MasterUser[UserID].DailyAttack.Inventory = {};
    }
    if(!!MasterUser[UserID].DailyAttack.FoodInventory == false){
      MasterUser[UserID].DailyAttack.FoodInventory = {
        "Apple": 0,
        "Taco": 0,
        "Pie": 0,
        "SuspiciousMushroom": 0,
        "Ambrosia": 0
      };
    }

    restoreStamina(MasterUser, UserID);

    if(!!args[0] == false){
      return;
    }

    let validFood = ["Apple", "Taco", "Pie", "SuspiciousMushroom", "Ambrosia"];
    let MoraleGain = {
      "Apple": 5,
      "Taco": 10,
      "Pie": 25,
      "SuspiciousMushroom": 0,
      "Ambrosia": 100
    }

    if(args[0] == "check"){
      let FoodInventoryMessage = "You own the following food: \n";
      FoodInventoryMessage += "Apple: " + MasterUser[UserID].DailyAttack.FoodInventory.Apple + "\n";
      FoodInventoryMessage += "Taco: " + MasterUser[UserID].DailyAttack.FoodInventory.Taco + "\n";
      FoodInventoryMessage += "Pie: " + MasterUser[UserID].DailyAttack.FoodInventory.Pie + "\n";
      FoodInventoryMessage += "SuspiciousMushroom: " + MasterUser[UserID].DailyAttack.FoodInventory.SuspiciousMushroom + "\n";
      FoodInventoryMessage += "Ambrosia: " + MasterUser[UserID].DailyAttack.FoodInventory.Ambrosia + "\n";
      message.channel.send(FoodInventoryMessage);
      return;
    }

    console.log(validFood.some((e) => e == args[0]));
    if(validFood.some((e) => e == args[0])){
      if(MasterUser[UserID].DailyAttack.FoodInventory[args[0]] >= 0){
        let SetCharacter = MasterUser[UserID].DailyAttack.SetCharacter;
        if(!!MasterUser[UserID].DailyAttack.Inventory[SetCharacter].Morale == false){
          MasterUser[UserID].DailyAttack.Inventory[SetCharacter].Morale = 50;
        }
        let GainedMoraleThisTime = 0;
        if(args[0] != "SuspiciousMushroom"){
          GainedMoraleThisTime = MoraleGain[args[0]];
        } else{
          GainedMoraleThisTime = getRandom(-20, 40); 
        }
        MasterUser[UserID].DailyAttack.Inventory[SetCharacter].Morale += GainedMoraleThisTime;
        MasterUser[UserID].DailyAttack.FoodInventory[args[0]]--;
        message.channel.send("You used a " + args[0] + " to recover " + GainedMoraleThisTime + " morale!\n" + SetCharacter + " has now " + MasterUser[UserID].DailyAttack.Inventory[SetCharacter].Morale + " morale!");
      } else{
        message.channel.send("You don't have enough " + args[0] + "s to perform this action!");
      }
    } else{
      message.channel.send("Invalid food!");
    }

    SaveJSON(MasterUser, "./PetBot/settings/user/master.json");
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

  if(!!MasterUser[UserID].LastDay == false){
    MasterUser[UserID].LastDay = "Never";
  }

  let LastDay = MasterUser[UserID].LastDay;
  if(fullDaysSinceEpoch != LastDay){
    MasterUser[UserID].DailyAttack.RemainingStamina += (fullDaysSinceEpoch - LastDay) * 100;
    if(MasterUser[UserID].DailyAttack.RemainingStamina > 700){
      MasterUser[UserID].DailyAttack.RemainingStamina = 700;
    }
  }
  MasterUser[UserID].LastDay = fullDaysSinceEpoch;
  SaveJSON(MasterUser, "./PetBot/settings/user/master.json");
}

function getRandom(min, max) {
  return rng.integer({min, max});
}