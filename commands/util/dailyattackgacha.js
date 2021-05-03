const { Command } = require('discord.js-commando');
const Discord = require('discord.js');
const fs = require('fs');
const rng = require('random-world');
const fetch = require('node-fetch');


module.exports = class DailyAttackGachaCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'dailyattackgacha',
            group: 'util',
            guildOnly: true,
            memberName: 'dailyattackgacha',
            description: 'Daily Attack Gacha Command',
            aliases: ['dag', 'dailyattackg', 'dattackg', 'dagacha']
        });
    }

   run(message, args) {
    let UserID = message.author.id;
    var MasterUser = JSON.parse(fs.readFileSync("./PetBot/settings/user/master.json"));
    var Settings = JSON.parse(fs.readFileSync("./PetBot/settings/master.json"));
    var CharList = JSON.parse(fs.readFileSync("./PetBot/settings/dailyattack/characters.json"));


    if(!registeredUser(MasterUser, UserID)){
      message.channel.send("I'm sorry! It seems you haven't registered an account yet, to make use of PetBot features you must first register.\nTry using !setname <Your name> to set up your username! This can be changed at any moment!\nUse !pp to read PetBot's Privacy Policy!");
      return;
    }

    if(!!MasterUser[UserID].DailyAttack == false){
      MasterUser[UserID].DailyAttack = {};
      MasterUser[UserID].DailyAttack.SetCharacter = null;
      MasterUser[UserID].DailyAttack.RemainingStamina = 100;
      MasterUser[UserID].DailyAttack.Inventory = {};
    }

    if(!!MasterUser[UserID].Diamonds == undefined){
        MasterUser[UserID].Diamonds = 5;
    }


    if(MasterUser[UserID].Diamonds < 1){
        message.channel.send("Not enough Diamonds to pull!");
        return;
    }

    DoAddInventory(message, CharList, MasterUser, Settings, UserID);
  }
}


  function DoAddInventory(message, CharList, MasterUser, Settings, UserID){
    console.log("CharList: " + CharList);
    let rateUp = getRandom(0, 100);
    let rateUpCharactersFirst = Settings.DailyAttack.Gacha.RateUpCharactersFirst;
    let c = 0;
    let min = 0;
    let max = (Object.keys(CharList.results)).length - 1;
    console.log(rateUp);
    if(rateUp > 50){
      console.log("Rate up activated!!");
      min = rateUpCharactersFirst;
    }

    let fetchURL = 'https://www.random.org/integers/?num=1&min=' + min + '&max=' + max + '&col=1&base=10&format=plain&rnd=new';
    fetch(fetchURL).then(res => {
      console.log("Res Status", res.status);
      console.log("Res OK", res.ok);
      if(res.ok){
        // console.log(res.text());
        return res.json();
      }
    }).then(data => {
      console.log("Data", data);
      let num = parseInt(data);

      message.channel.send("*" + CharList.results[Object.keys(CharList.results)[num]].SummonMessage + "*\n\nYou got: " + Object.keys(CharList.results)[num]);

      console.log(Object.keys(CharList.results)[num]);
      let ObtainedName = Object.keys(CharList.results)[num];

      console.log("ObtainedName: " + ObtainedName);

      if(!!MasterUser[UserID].DailyAttack.Inventory[ObtainedName] == true){ // exists
        MasterUser[UserID].DailyAttack.Inventory[ObtainedName].Level++;
        message.channel.send("You already had this character so it has leveled up!");
      } else {
        console.log("Added to inventory!");
        MasterUser[UserID].DailyAttack.Inventory[ObtainedName] = {
          "Level": 1
        };
      }

      MasterUser[UserID].Diamonds += -1;

      let FixedJSON = JSON.stringify(MasterUser, null, "\t");
      fs.writeFileSync("./PetBot/settings/user/master.json",FixedJSON);
      let FixedJSON2 = JSON.stringify(Settings, null, "\t");
      fs.writeFileSync("./PetBot/settings/master.json",FixedJSON2);    
    }).catch(err => {
      message.channel.send("An unexpected error has occurred. Details: ", err.message);
      console.log(err.message);
    });
    return; // All code below is just for reference, using HTTPS instead of node-fetch
   
    https.get('https://www.random.org/integers/?num=1&min=' + min + '&max=' + max + '&col=1&base=10&format=plain&rnd=new', (resp) => {
        let data = '';

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    console.log(data);
    let num = parseInt(data);
    //console.log(JSON.parse(data).explanation);
    /* console.log(CharList.results);
    console.log((CharList.results)[num]);
    console.log(Object.keys(CharList.results));
    console.log(Object.keys(CharList.results)[num]);
    console.log(CharList.results[Object.keys(CharList.results)[num]]); */

    message.channel.send("*" + CharList.results[Object.keys(CharList.results)[num]].SummonMessage + "*\n\nYou got: " + Object.keys(CharList.results)[num]);

    console.log(Object.keys(CharList.results)[num]);
    let ObtainedName = Object.keys(CharList.results)[num];

    console.log("ObtainedName: " + ObtainedName);

    if(!!MasterUser[UserID].DailyAttack.Inventory[ObtainedName] == true){ // exists
        MasterUser[UserID].DailyAttack.Inventory[ObtainedName].Level++;
        message.channel.send("You already had this character so it has leveled up!");
    } else {
        console.log("Added to inventory!");
        MasterUser[UserID].DailyAttack.Inventory[ObtainedName] = {
          "Level": 1
        };
    }

    MasterUser[UserID].Diamonds += -1;

    let FixedJSON = JSON.stringify(MasterUser, null, "\t");
    fs.writeFileSync("./PetBot/settings/user/master.json",FixedJSON);
    let FixedJSON2 = JSON.stringify(Settings, null, "\t");
    fs.writeFileSync("./PetBot/settings/master.json",FixedJSON2);

  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});

return;
}

function registeredUser(MasterUser, UserID){
  return !!MasterUser[UserID] == true;
}

function getRandom(min, max) {
    return rng.integer({min, max});
}