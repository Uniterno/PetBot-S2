const { Command } = require('discord.js-commando');
const Discord = require('discord.js');
const fs = require('fs');
const rng = require('random-world');


module.exports = class DailyAttackCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'dailyattack_copy',
            group: 'util',
            guildOnly: true,
            memberName: 'dailyattack_copy',
            description: 'Daily Attack Gacha Command (Not pull, play).'
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

    if(!!MasterUser[UserID].DailyAttack.Buffs == false){
      MasterUser[UserID].DailyAttack.Buffs = {
        "AngelsRevelation": {
          "Enabled": false,
          "Ready": false
        }
      }
    }

    registerToServer(UserID, message.guild.id);

    var Settings = JSON.parse(fs.readFileSync("./PetBot/settings/master.json"));
    var UserSettings = JSON.parse(fs.readFileSync("./PetBot/settings/user/settings.json"));
    let CharactersDB = JSON.parse(fs.readFileSync("./PetBot/settings/dailyAttack/charactersAll.json")).results;
    var CurrentBoss = Settings.DailyAttack.CurrentBoss;

    if(!!MasterUser[UserID].DailyAttack == false){
      MasterUser[UserID].DailyAttack = {};
      MasterUser[UserID].DailyAttack.SetCharacter = null;
      MasterUser[UserID].DailyAttack.RemainingStamina = 100;
      MasterUser[UserID].DailyAttack.Inventory = {};
    }
    console.log("test 4");

    restoreStamina(MasterUser, UserID);

    if(args[0] == "set"){
      if(!!args[1] == false){
        message.channel.send("Chosen character is not valid.");
        return;
      }
      let Chosen = args[1];
      if(!!MasterUser[UserID].DailyAttack.Inventory[Chosen] == false){
        message.channel.send("You don't own this character or it doesn't exist.");
        return;
      } else{
        if(MasterUser[UserID].DailyAttack.Inventory[Chosen].Level <= 0){
          message.channel.send("You don't own this character!");
          return;
        } else{
          MasterUser[UserID].DailyAttack.SetCharacter = args[1];
          message.channel.send("Your set character has been updated!");
        }
      }
    } else if(args[0] == "check"){
      let WeekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
       if(args[1] == "boss"){
        let ToSendMessage = "";
        if(args[2] == "debuffs"){
          let DebuffsObject = Settings.DailyAttack.Boss[CurrentBoss].Debuffs;
          if(DebuffsObject.DefenseDown != 0){
            ToSendMessage += "Defense down: " + DebuffsObject.DefenseDown*100 + "%\n"; 
          }
          if(DebuffsObject.AttackTypeDefenseDownValue != 0){
            ToSendMessage += "Defense down to attack type (Unicorn): " + DebuffsObject.AttackTypeDefenseDownValue*100 + "% (" + DebuffsObject.AttackTypeDefenseDown + ")\n"; 
          }
          if(DebuffsObject.DebuffedAttackTypeValue != 0){
            ToSendMessage += "Defense down to attack type: " + DebuffsObject.DebuffedAttackTypeValue*100 + "% (" + DebuffsObject.DebuffedAttackType + ")\n"; 
          }
          if(DebuffsObject.DebuffedAttributeValue != 0){
            ToSendMessage += "Defense down to attribute: " + DebuffsObject.DebuffedAttributeValue*100 + "% (" + DebuffsObject.DebuffedAttribute + ")\n"; 
          }
          if(DebuffsObject.DebuffsTurnsLeft >= 0){
            ToSendMessage += "Turns left: " + (DebuffsObject.DebuffsTurnsLeft + 1) + "\n"; 
          }
          for(let i = 0; i < Object.keys(DebuffsObject.ContributionTo).length; i++){
            let CurrentlySelectedPlayerID = Object.keys(DebuffsObject.ContributionTo)[i];
            if(!!UserSettings[CurrentlySelectedPlayerID] == false){
                UserSettings[CurrentlySelectedPlayerID] = UserSettings.default;
              }
            if(UserSettings[CurrentlySelectedPlayerID]['#share-username-external-servers']){
                ToSendMessage += "Score contribution to " + MasterUser[CurrentlySelectedPlayerID].Name + ": " + DebuffsObject.ContributionTo[CurrentlySelectedPlayerID].Amount*100 + "% (" + (DebuffsObject.ContributionTo[CurrentlySelectedPlayerID].TurnsLeft + 1) + " attacks left)\n"; 
              } else{
                if(UserSettings.default['#share-username-external-servers'] == true && UserSettings[CurrentlySelectedPlayerID]['#share-username-external-servers'] == undefined){
                  ToSendMessage += "Score contribution to " + MasterUser[CurrentlySelectedPlayerID].Name + ": " + DebuffsObject.ContributionTo[CurrentlySelectedPlayerID].Amount*100 + "% (" + (DebuffsObject.ContributionTo[CurrentlySelectedPlayerID].TurnsLeft + 1) + " attacks left)\n"; 
                } else{
                  if(!!UserSettings[CurrentlySelectedPlayerID]['#randomized-generic-name-external-servers'] == false){
                    UserSettings[CurrentlySelectedPlayerID]['#randomized-generic-name-external-servers'] = rng.word();
                    SaveJSON(UserSettings, "./PetBot/settings/user/settings.json");
                  }
                  ToSendMessage += "Score contribution to " + UserSettings[CurrentlySelectedPlayerID]['#randomized-generic-name-external-servers'] +  " (A)" + ": " + DebuffsObject.ContributionTo[CurrentlySelectedPlayerID].Amount*100 + "% (" + (DebuffsObject.ContributionTo[CurrentlySelectedPlayerID].TurnsLeft + 1) + " attacks left)\n"; 
                }
              }
          }
          console.log(DebuffsObject);
          for(let i = 0; i < Object.keys(DebuffsObject.IncreaseCriticalDamage).length; i++){
            let CurrentlySelectedPlayerID = Object.keys(DebuffsObject.IncreaseCriticalDamage)[i];
            if(!!UserSettings[CurrentlySelectedPlayerID] == false){
                UserSettings[CurrentlySelectedPlayerID] = UserSettings.default;
            } 
            for(let x = 0; x < DebuffsObject.IncreaseCriticalDamage[CurrentlySelectedPlayerID].length; x++){
              if(UserSettings[CurrentlySelectedPlayerID]['#share-username-external-servers']){
                ToSendMessage += "Critical damage increased for " + MasterUser[CurrentlySelectedPlayerID].Name + ": " + DebuffsObject.IncreaseCriticalDamage[CurrentlySelectedPlayerID][x].Amount*100 + "% (" + (DebuffsObject.IncreaseCriticalDamage[CurrentlySelectedPlayerID][x].TurnsLeft + 1) + " attacks left)\n"; 
              } else{
                if(UserSettings.default['#share-username-external-servers'] == true && UserSettings[CurrentlySelectedPlayerID]['#share-username-external-servers'] == undefined){
                  ToSendMessage += "Critical damage increased for " + MasterUser[CurrentlySelectedPlayerID].Name + ": " + DebuffsObject.IncreaseCriticalDamage[CurrentlySelectedPlayerID][x].Amount*100 + "% (" + (DebuffsObject.IncreaseCriticalDamage[CurrentlySelectedPlayerID][x].TurnsLeft + 1) + " attacks left)\n"; 
                } else{
                  if(!!UserSettings[CurrentlySelectedPlayerID]['#randomized-generic-name-external-servers'] == false){
                    UserSettings[CurrentlySelectedPlayerID]['#randomized-generic-name-external-servers'] = rng.word();
                    SaveJSON(UserSettings, "./PetBot/settings/user/settings.json");
                  }
                  ToSendMessage += "Critical damage increased for " + UserSettings[CurrentlySelectedPlayerID]['#randomized-generic-name-external-servers'] +  " (A)" + ": " + DebuffsObject.IncreaseCriticalDamage[CurrentlySelectedPlayerID][x].Amount*100 + "% (" + (DebuffsObject.IncreaseCriticalDamage[CurrentlySelectedPlayerID][x].TurnsLeft + 1) + " attacks left)\n"; 
                }
              }
            }
            
            
          }

          for(let i = 0; i < Object.keys(DebuffsObject.IgnoreStaminaConsumption).length; i++){
            let CurrentlySelectedPlayerID = Object.keys(DebuffsObject.IgnoreStaminaConsumption)[i];
            if(!!UserSettings[CurrentlySelectedPlayerID] == false){
                UserSettings[CurrentlySelectedPlayerID] = UserSettings.default;
              }
            if(UserSettings[CurrentlySelectedPlayerID]['#share-username-external-servers']){
                ToSendMessage += "Ignore stamina consumption for " + MasterUser[CurrentlySelectedPlayerID].Name + " (" + (DebuffsObject.IgnoreStaminaConsumption[CurrentlySelectedPlayerID].TurnsLeft + 1) + " attacks left)\n"; 
              } else{
                if(UserSettings.default['#share-username-external-servers'] == true && UserSettings[CurrentlySelectedPlayerID]['#share-username-external-servers'] == undefined){
                  ToSendMessage += "Ignore stamina consumption for " + MasterUser[CurrentlySelectedPlayerID].Name + " (" + (DebuffsObject.IgnoreStaminaConsumption[CurrentlySelectedPlayerID].TurnsLeft + 1) + " attacks left)\n"; 
                } else{
                  if(!!UserSettings[CurrentlySelectedPlayerID]['#randomized-generic-name-external-servers'] == false){
                    UserSettings[CurrentlySelectedPlayerID]['#randomized-generic-name-external-servers'] = rng.word();
                    SaveJSON(UserSettings, "./PetBot/settings/user/settings.json");
                  }
                  ToSendMessage += "Ignore stamina consumption for " + UserSettings[CurrentlySelectedPlayerID]['#randomized-generic-name-external-servers'] +  " (A)" + " (" + (DebuffsObject.IgnoreStaminaConsumption[CurrentlySelectedPlayerID].TurnsLeft + 1) + " attacks left)\n"; 
                }
              }
          }

          // ToSendMessage += JSON.stringify(Settings.DailyAttack.Boss[CurrentBoss].Debuffs, null, "\t");

          if(ToSendMessage.length == 0){
            ToSendMessage += "This boss has no debuffs applied.";
          }

          message.channel.send(ToSendMessage);
        } else{
          ToSendMessage += "Remaining HP: " + Settings.DailyAttack.Boss[CurrentBoss].HP + "\n";
          if(Settings.DailyAttack.Boss[CurrentBoss].Attribute != "Daily"){
            ToSendMessage += "Attribute: " + Settings.DailyAttack.Boss[CurrentBoss].Attribute + "\n"; 
          } else{
            ToSendMessage += "Attribute: (" + WeekDays[DateV.getUTCDay()] + ") " + Settings.DailyAttack.Boss[CurrentBoss].Daily.Attribute[DateV.getUTCDay()] + "\n";
          }
          if(Settings.DailyAttack.Boss[CurrentBoss].WeakTo != "Daily"){
            ToSendMessage += "Weak to: " + Settings.DailyAttack.Boss[CurrentBoss].WeakTo + "\n"; 
          } else{
            ToSendMessage += "Weak to: (" + WeekDays[DateV.getUTCDay()] + ") " + Settings.DailyAttack.Boss[CurrentBoss].Daily.WeakTo[DateV.getUTCDay()] + "\n";
          }
          if(Settings.DailyAttack.Boss[CurrentBoss].ResistantTo != "Daily"){
            ToSendMessage += "Resistant to: " + Settings.DailyAttack.Boss[CurrentBoss].ResistantTo + "\n";
          } else{
            ToSendMessage += "Resistant to: (" + WeekDays[DateV.getUTCDay()] + ") " + Settings.DailyAttack.Boss[CurrentBoss].Daily.ResistantTo[DateV.getUTCDay()] + "\n";
          }
        
          ToSendMessage += "You can also use debuffs as third argument to check this boss current debuffs.";
          message.channel.send(ToSendMessage);
        }
      } else if(args[1] == "ranking"){
        console.log("test 3");
        let ToSendMessage = "";
        if(args[2] == "server"){
          ToSendMessage += "Ranking for this server!\n";
        } else{
          ToSendMessage += "Ranking for all servers!\n";
        }

        let GuildSettings = JSON.parse(fs.readFileSync("./PetBot/settings/user/serverlist.json"));
        let GuildID = message.guild.id;
        let TotalDamage = 0;
        let CurrentPlace = 1;

        for(let i = 0; i < Object.values(Settings.DailyAttack.Boss[CurrentBoss].DamageDealtBy).length; i++){
          console.log("test 2");
          TotalDamage += Object.values(Settings.DailyAttack.Boss[CurrentBoss].DamageDealtBy)[i];
        }

        // First, calculate it in an orderly manner.

        let orderedScores = sort_object(Settings.DailyAttack.Boss[CurrentBoss].DamageDealtBy);
        console.log(orderedScores);

        for(let i = 0; i < Object.keys(orderedScores).length; i++){
          console.log("test 1");
          let CurrentlySelectedPlayerID = Object.keys(orderedScores)[i];

          if(args[2] == "server"){
            if(GuildSettings[GuildID].includes(CurrentlySelectedPlayerID)){
              let Contribution = ((Settings.DailyAttack.Boss[CurrentBoss].DamageDealtBy[CurrentlySelectedPlayerID] / TotalDamage) * 100).toFixed(2) + "%";
              ToSendMessage += CurrentPlace + ") " + MasterUser[CurrentlySelectedPlayerID].Name + ": " + Settings.DailyAttack.Boss[CurrentBoss].DamageDealtBy[CurrentlySelectedPlayerID] + " (" + Contribution + ")\n";
              CurrentPlace++;
            }
          } else{
              let Contribution = ((Settings.DailyAttack.Boss[CurrentBoss].DamageDealtBy[CurrentlySelectedPlayerID] / TotalDamage) * 100).toFixed(2) + "%";
              if(!!UserSettings[CurrentlySelectedPlayerID] == false){
                UserSettings[CurrentlySelectedPlayerID] = UserSettings.default;
              }
              if(UserSettings[CurrentlySelectedPlayerID]['#share-username-external-servers']){
                ToSendMessage += CurrentPlace + ") " + MasterUser[CurrentlySelectedPlayerID].Name + ": " + Settings.DailyAttack.Boss[CurrentBoss].DamageDealtBy[CurrentlySelectedPlayerID] + " (" + Contribution + ")\n"; 
              } else{
                if(UserSettings.default['#share-username-external-servers'] == true && UserSettings[CurrentlySelectedPlayerID]['#share-username-external-servers'] == undefined){
                  ToSendMessage += CurrentPlace + ") " + MasterUser[CurrentlySelectedPlayerID].Name + ": " + Settings.DailyAttack.Boss[CurrentBoss].DamageDealtBy[CurrentlySelectedPlayerID] + " (" + Contribution + ")\n";   
                } else{
                  if(!!UserSettings[CurrentlySelectedPlayerID]['#randomized-generic-name-external-servers'] == false){
                    UserSettings[CurrentlySelectedPlayerID]['#randomized-generic-name-external-servers'] = rng.word();
                    SaveJSON(UserSettings, "./PetBot/settings/user/settings.json");
                  }
                  ToSendMessage += CurrentPlace + ") " + UserSettings[CurrentlySelectedPlayerID]['#randomized-generic-name-external-servers'] +  " (A): " + Settings.DailyAttack.Boss[CurrentBoss].DamageDealtBy[CurrentlySelectedPlayerID] + " (" + Contribution + ")\n";  
                }
              }
              
              CurrentPlace++;
          }

        }

        message.channel.send(ToSendMessage);
      } else if(args[1] != undefined){
        console.log(args[1]);
        let ToSendMessage = "";
        if(!!MasterUser[UserID].DailyAttack.Inventory[args[1]] == false){
          message.channel.send("You don't own this character or it doesn't exit");
          return;
        }
        let CheckingCharacter = MasterUser[UserID].DailyAttack.Inventory[args[1]];
        ToSendMessage += "**" + args[1] + "**\n\n";

        let CharacterLevelTemp = CheckingCharacter.Level;
        ToSendMessage += "Level: " + CharacterLevelTemp + "\n";
        CheckingCharacter = CharactersDB[args[1]];
        //console.log(CheckingCharacter);
        if(CheckingCharacter.Progression.Damage.Type == "Multiplier"){
          ToSendMessage += "Damage: " + CheckingCharacter.Damage * (1 + (CharacterLevelTemp-1) * CheckingCharacter.Progression.Damage.Value) + " (Base: " + CheckingCharacter.Damage + ")\n";
        } else if(CheckingCharacter.Progression.Damage.Type == "Addition"){
          ToSendMessage += "Damage: " + CheckingCharacter.Damage + ((CharacterLevelTemp-1) * CheckingCharacter.Progression.Damage.Value) + " (Base: " + CheckingCharacter.Damage + ")\n";
        }
        if(CheckingCharacter.Progression.StaminaUsage.Type == "Multiplier"){
          ToSendMessage += "Stamina consumption: " + CheckingCharacter.StaminaUsage * (1 + (CharacterLevelTemp-1) * CheckingCharacter.Progression.StaminaUsage.Value) + " (Base: " + CheckingCharacter.StaminaUsage + ")\n";
        } else if(CheckingCharacter.Progression.StaminaUsage.Type == "Addition"){
          ToSendMessage += "Stamina consumption: " + parseFloat(CheckingCharacter.StaminaUsage) + parseFloat(((CharacterLevelTemp-1) * CheckingCharacter.Progression.StaminaUsage.Value)) + " (Base: " + CheckingCharacter.StaminaUsage + ")\n";
        }
        if(CheckingCharacter.Progression.CritChance.Type == "Multiplier"){
          ToSendMessage += "Critical rate: " + CheckingCharacter.CritChance * (1 + (CharacterLevelTemp-1) * CheckingCharacter.Progression.CritChance.Value) + " (Base: " + CheckingCharacter.CritChance + ")\n";
        } else if(CheckingCharacter.Progression.CritChance.Type == "Addition"){
          let CriticalRateToSend = +CheckingCharacter.CritChance + ((+CharacterLevelTemp-1) * (+CheckingCharacter.Progression.CritChance.Value));
          ToSendMessage += "Critical rate: " + CriticalRateToSend + " (Base: " + CheckingCharacter.CritChance + ")\n";
        }
        if(CheckingCharacter.Progression.CriticalAffinity.Type == "Multiplier"){
          ToSendMessage += "Critical affinity: " + CheckingCharacter.CriticalAffinity * (1 + (CharacterLevelTemp-1) * CheckingCharacter.Progression.CriticalAffinity.Value) + " (Base: " + CheckingCharacter.CriticalAffinity + ")\n";
        } else if(CheckingCharacter.Progression.CriticalAffinity.Type == "Addition"){
          let CriticalAffinityToSend = +CheckingCharacter.CriticalAffinity + ((+CharacterLevelTemp-1) * +CheckingCharacter.Progression.CriticalAffinity.Value);
          ToSendMessage += "Critical affinity: " + CriticalAffinityToSend + " (Base: " + CheckingCharacter.CriticalAffinity + ")\n";
        }

        if(!!CheckingCharacter.Morale == false){
          CheckingCharacter.Morale = 50;
        }

        ToSendMessage += "Morale: " + CheckingCharacter.Morale + "\n";
        ToSendMessage += "\nSkill description: " + CheckingCharacter.Skill.Description + "\n";
        if(!!CheckingCharacter.Skill.Tier){
          let Tiers = ["I", "II", "III", "IV", "V"];
          let CurrentTier = "0";
          if(CharacterLevelTemp >= 10){
            CurrentTier = Tiers[0];
          }
          ToSendMessage += "Skill tier: " + CurrentTier + "\n\n";
        }
        ToSendMessage += "Summon message: *" + CheckingCharacter.SummonMessage + "*\n\n";
        ToSendMessage += "Character individual progression effects: \n" + CheckingCharacter.Progression.Description + "\n";

        message.channel.send(ToSendMessage);
      } else{ // Own profile
        let ToSendMessage = "";
        ToSendMessage += "Remaining stamina: " + MasterUser[UserID].DailyAttack.RemainingStamina + "\n\n";
        ToSendMessage += "*Characters*" + "\n";
        for(let i = 0; i < Object.keys(MasterUser[UserID].DailyAttack.Inventory).length; i++){
          if(Object.keys(MasterUser[UserID].DailyAttack.Inventory)[i] == MasterUser[UserID].DailyAttack.SetCharacter){
            ToSendMessage += "**"; // Bold currently set up character
          }
          ToSendMessage += Object.keys(MasterUser[UserID].DailyAttack.Inventory)[i] + ": ";
          ToSendMessage += MasterUser[UserID].DailyAttack.Inventory[Object.keys(MasterUser[UserID].DailyAttack.Inventory)[i]].Level;
          if(Object.keys(MasterUser[UserID].DailyAttack.Inventory)[i] == MasterUser[UserID].DailyAttack.SetCharacter){
            ToSendMessage += "**"; // End bold
          }
          ToSendMessage += "\n";
        }
        ToSendMessage += "\n"
        let TotalDamage = 0;
        for(let i = 0; i < Object.values(Settings.DailyAttack.Boss[CurrentBoss].DamageDealtBy).length; i++){
          TotalDamage += Object.values(Settings.DailyAttack.Boss[CurrentBoss].DamageDealtBy)[i];
        }
        let Contribution = ((Settings.DailyAttack.Boss[CurrentBoss].DamageDealtBy[UserID] / TotalDamage) * 100).toFixed(2) + "%";
        ToSendMessage += "Damage contribution: " + Contribution + " (" + Settings.DailyAttack.Boss[CurrentBoss].DamageDealtBy[UserID] + "/" + TotalDamage + ")";
        message.channel.send(ToSendMessage);
      }

      return; //return after sending message if check
    } else{

      if(Settings.DailyAttack.Boss[CurrentBoss].HP <= 0){
        message.channel.send("The boss is already dead.");
        return;
      }
      //console.log("Checked if boss is already dead!");

      if(!!MasterUser[UserID].DailyAttack == false){
        message.channel.send("An error has ocurred. Maybe set up a character first?");
        return;
      }
      //console.log("Checked if !!MasterUser[UserID].DailyAttack == false");

      let CurrentlyUsingCharacter = MasterUser[UserID].DailyAttack.SetCharacter;
      let CharacterLevel = MasterUser[UserID].DailyAttack.Inventory[CurrentlyUsingCharacter].Level;

      if(!!CurrentlyUsingCharacter == false || !!MasterUser[UserID].DailyAttack.SetCharacter == false){
        message.channel.send("Set a character first!");
        return;
      }

      console.log("Checked that a character is properly set!");

      let RequiredStamina = CharactersDB[CurrentlyUsingCharacter].StaminaUsage;
      let LastAttackAttribute = Settings.DailyAttack.Boss[CurrentBoss].LastAttackAttribute 
      let CurrentAttackAttribute = CharactersDB[CurrentlyUsingCharacter].Attribute;
      Settings.DailyAttack.Boss[CurrentBoss].LastAttackAttribute = CurrentAttackAttribute;

      if(!!MasterUser[UserID].DailyAttack.Inventory[CurrentlyUsingCharacter].Morale == false){
          MasterUser[UserID].DailyAttack.Inventory[CurrentlyUsingCharacter].Morale = 50;
      }


      if(CharactersDB[CurrentlyUsingCharacter].Progression.StaminaUsage.Type == "Multiplier"){
        RequiredStamina *= (1 + (CharacterLevel-1) * CharactersDB[CurrentlyUsingCharacter].Progression.StaminaUsage.Value);
      } else if(CharactersDB[CurrentlyUsingCharacter].StaminaUsage.Type == "Addition"){
        RequiredStamina += parseFloat(((CharacterLevel-1) * CharactersDB[CurrentlyUsingCharacter].Progression.StaminaUsage.Value));
      }

      if(LastAttackAttribute == "Fire" && CurrentAttackAttribute == "Water"){
        RequiredStamina = Math.round(RequiredStamina * 0.9);
      } else if(LastAttackAttribute == "Water" && CurrentAttackAttribute == "Fire"){
        RequiredStamina = Math.round(RequiredStamina * 0.95);
      } else if(LastAttackAttribute == "Ice" && CurrentAttackAttribute == "Water"){
        RequiredStamina = Math.round(RequiredStamina * 0.95);
      }

      if(MasterUser[UserID].DailyAttack.RemainingStamina >= RequiredStamina){
        // attack
        console.log("Checked that stamina usage is valid!");
        let MessageInfo = "";
        let Damage = CharactersDB[CurrentlyUsingCharacter].Damage;
        console.log("Base damage: " + Damage);

        let DamageDealtDueToMorale = 1;
        let StaminaSpentDueToMorale = 1;
        let RefusedToSkill = false;
        let RefusedToAttack = false;
        let ExtraFoodGatheringDueToMorale = 0;
        let MoraleMessage = "";


        if(MasterUser[UserID].DailyAttack.Inventory[CurrentlyUsingCharacter].Morale == 0){
          let ActivatedEffect = getRandom(0, 4);
          let ActivatedEffect2 = getRandom(0, 4);
          while(ActivatedEffect == ActivatedEffect2){
            ActivatedEffect2 = getRandom(0, 4);
          }
          if(ActivatedEffect == 0 || ActivatedEffect2 == 0){ // 25% less damage dealt
            DamageDealtDueToMorale = 0.75;
            MoraleMessage += "25% less damage dealt due to low morale!\n";
          }
          if(ActivatedEffect == 1 || ActivatedEffect2 == 1){ // 20% more stamina spent
            StaminaSpentDueToMorale = 1.2;
            MoraleMessage += "20% more stamina spent due to low morale!\n";
          }
          if(ActivatedEffect == 2 || ActivatedEffect2 == 2){ // Refused to activate skill
            RefusedToSkill = true;
            MoraleMessage += "Refused to activate skill due to low morale!\n";
          }
          if(ActivatedEffect == 3 || ActivatedEffect2 == 3){ // Refused to attack
            RefusedToAttack = true;
            MoraleMessage += "Refused to attack due to low morale!\n";
          }
        } else if(MasterUser[UserID].DailyAttack.Inventory[CurrentlyUsingCharacter].Morale < 10){
          let ActivatedEffect = getRandom(0, 3);
          if(ActivatedEffect == 0){ // 15% less damage dealt
            DamageDealtDueToMorale = 0.85;
            MoraleMessage += "15% less damage dealt due to low morale!\n";
          } else if(ActivatedEffect == 1){ // 10% more stamina spent
            StaminaSpentDueToMorale = 1.1;
            MoraleMessage += "10% more stamina spent due to low morale!\n";
          } else if(ActivatedEffect == 2){ // Refused to activate skill
            RefusedToSkill = true;
            MoraleMessage += "Refused to activate skill due to low morale!\n";
          }
        } else if(MasterUser[UserID].DailyAttack.Inventory[CurrentlyUsingCharacter].Morale < 25){
          let ActivatedEffect = getRandom(0, 2);
          if(ActivatedEffect == 0){ // 15% less damage dealt
            DamageDealtDueToMorale = 0.85;
            MoraleMessage += "15% less damage dealt due to low morale!\n";
          } else if(ActivatedEffect == 1){ // 10% more stamina spent
            StaminaSpentDueToMorale = 1.05;
            MoraleMessage += "5% more stamina spent due to low morale!\n";
          }
        } else if(MasterUser[UserID].DailyAttack.Inventory[CurrentlyUsingCharacter].Morale > 75){
          let ActivatedEffect = getRandom(0, 2);
          if(ActivatedEffect == 0){ // 15% more damage dealt
            DamageDealtDueToMorale = 1.15;
            MoraleMessage += "15% more damage dealt due to high morale!\n";
          } else if(ActivatedEffect == 1){ // 10% more stamina spent
            StaminaSpentDueToMorale = 0.95;
            MoraleMessage += "5% less stamina spent due to high morale!\n";
          }
        } else if(MasterUser[UserID].DailyAttack.Inventory[CurrentlyUsingCharacter].Morale > 90){
          let ActivatedEffect = getRandom(0, 3);
          if(ActivatedEffect == 0){ // 15% more damage dealt
            DamageDealtDueToMorale = 1.15;
            MoraleMessage += "15% more damage dealt due to high morale!\n";
          } else if(ActivatedEffect == 1){ // 10% more stamina spent
            StaminaSpentDueToMorale = 0.9;
            MoraleMessage += "10% less stamina spent due to high morale!\n";
          } else if(ActivatedEffect == 2){
            ExtraFoodGatheringDueToMorale = true;
            MoraleMessage += "+10 Food Gathering due to high morale!\n";
          }
        } else if(MasterUser[UserID].DailyAttack.Inventory[CurrentlyUsingCharacter].Morale == 100){
            DamageDealtDueToMorale = 1.25;
            MoraleMessage += "25% more damage dealt due to high morale!\n";
            StaminaSpentDueToMorale = 0.9;
            MoraleMessage += "10% less stamina spent due to high morale!\n";
        }

        Damage *= DamageDealtDueToMorale;

        if(LastAttackAttribute == "Fire" && CurrentAttackAttribute == "Ice"){
          Damage *= 1.05;
          console.log("Fire x Ice combo: " + Damage);
        } else if(LastAttackAttribute == "Water" && CurrentAttackAttribute == "Fire"){
          Damage *= 1.02;
          console.log("Water x Fire combo: " + Damage);
        } else if(LastAttackAttribute == "Ice" && CurrentAttackAttribute == "Fire"){
          Damage *= 1.15;
          console.log("Ice x Fire combo: " + Damage);
        }

        if(CharactersDB[CurrentlyUsingCharacter].Progression.Damage.Type == "Multiplier"){
          Damage *= ((1 + (CharacterLevel-1) * CharactersDB[CurrentlyUsingCharacter].Progression.Damage.Value));
        } else if(CharactersDB[CurrentlyUsingCharacter].Progression.Damage.Type == "Addition"){
          Damage += ((CharacterLevel-1) * CharactersDB[CurrentlyUsingCharacter].Progression.Damage.Value)
        }

        console.log("After level: " + Damage);
        if(Settings.DailyAttack.Boss[CurrentBoss].Attribute == Settings.DailyAttack.Attributes[CharactersDB[CurrentlyUsingCharacter].Attribute].Effective || (Settings.DailyAttack.Boss[CurrentBoss].Attribute == "Daily" && Settings.DailyAttack.Boss[CurrentBoss].Daily.Attribute[DateV.getUTCDay()] == Settings.DailyAttack.Attributes[CharactersDB[CurrentlyUsingCharacter].Attribute].Effective)){
          // Effective against boss attribute
          Damage *= 1 +  0.01 * getRandom(1, 75);
          MessageInfo += "Effective attribute!\n";
        }
        console.log("Effective attribute: " + Damage);

        if(Settings.DailyAttack.Boss[CurrentBoss].WeakTo == CharactersDB[CurrentlyUsingCharacter].AttackType || CharactersDB[CurrentlyUsingCharacter].AttackType == "Death" || (Settings.DailyAttack.Boss[CurrentBoss].WeakTo == "Daily" && Settings.DailyAttack.Boss[CurrentBoss].Daily.WeakTo[DateV.getUTCDay()] == CharactersDB[CurrentlyUsingCharacter].AttackType)){
          // Effective type attack
          Damage *= 1 +  0.01 * getRandom(1, 50);
          MessageInfo += "Effective attack type!\n";
        }
        console.log("Effective attack type: " + Damage);

        let CritChance = getRandom(1, 100);
        let AngelsRevelationExtraCriticalDamage = 0;

        if(MasterUser[UserID].DailyAttack.Buffs.AngelsRevelation.Ready){
          CritChance -= 50 - Math.round(0.4*CharactersDB[CurrentlyUsingCharacter].CriticalAffinity);
          AngelsRevelationExtraCriticalDamage = 35 + Math.round(0.4*CharactersDB[CurrentlyUsingCharacter].CriticalAffinity);
          MasterUser[UserID].DailyAttack.Buffs.AngelsRevelation.Ready = false;
        }

        console.log("Critical chance after Angel's Revelation: " + CritChance);

        let CritChanceAfterLevel = CharactersDB[CurrentlyUsingCharacter].CritChance;

        if(CharactersDB[CurrentlyUsingCharacter].Progression.CritChance.Type == "Multiplier"){
          CritChanceAfterLevel *= (1 + (CharacterLevel-1) * CharactersDB[CurrentlyUsingCharacter].Progression.CritChance.Value);
        } else if(CharactersDB[CurrentlyUsingCharacter].Progression.CritChance.Type == "Addition"){
          CritChanceAfterLevel += ((+CharacterLevel-1) * (+CharactersDB[CurrentlyUsingCharacter].Progression.CritChance.Value));
        }

        if(DateV.getUTCDay() == 0 || DateV.getUTCDay() == 3){
            CritChanceAfterLevel += 20; // TEMPORARY PLEASE REMOVE LATER KTHX
        }

        if(LastAttackAttribute == "Physical" && CurrentAttackAttribute == "Physical"){
          CritChanceAfterLevel += 10;
        }


        if(CritChance <= CritChanceAfterLevel){
          // Critical hit

          let MinimumCriticalIncrease = 1 + AngelsRevelationExtraCriticalDamage;
          let MaximumCriticalIncrease = 25 + AngelsRevelationExtraCriticalDamage;

          console.log("Current MinimumCriticalIncrease: " + MinimumCriticalIncrease);
          console.log("Current MaximumCriticalIncrease: " + MaximumCriticalIncrease);

          if(!!CharactersDB[CurrentlyUsingCharacter].CriticalAffinity){
            let CharactersCriticalAffinity = CharactersDB[CurrentlyUsingCharacter].CriticalAffinity;

            if(CharactersDB[CurrentlyUsingCharacter].Progression.CriticalAffinity.Type == "Multiplier"){
              CharactersCriticalAffinity *= (1 + (CharacterLevel-1) * CharactersDB[CurrentlyUsingCharacter].Progression.CriticalAffinity.Value);
            } else if(CharactersDB[CurrentlyUsingCharacter].Progression.CriticalAffinity.Type == "Addition"){
              CharactersCriticalAffinity += ((+CharacterLevel-1) * (+CharactersDB[CurrentlyUsingCharacter].Progression.CriticalAffinity.Value));
            }

            MinimumCriticalIncrease += CharactersCriticalAffinity;
            MaximumCriticalIncrease += CharactersCriticalAffinity;

            console.log("(+CriticalAffinity) Current MinimumCriticalIncrease: " + MinimumCriticalIncrease);
            console.log("(+CriticalAffinity) Current MaximumCriticalIncrease: " + MaximumCriticalIncrease);
          }



          if(DateV.getUTCDay() == 1 || DateV.getUTCDay() == 4){

            MinimumCriticalIncrease += 40; // TEMPORARY PLEASE REMOVE LATER KTHX
            MaximumCriticalIncrease += 40; // TEMPORARY PLEASE REMOVE LATER KTHX

            console.log("After boss special effect MinimumCriticalIncrease: " + MinimumCriticalIncrease);
            console.log("After boss special effect MaximumCriticalIncrease: " + MaximumCriticalIncrease);
          }

          if(LastAttackAttribute == "Physical" && CurrentAttackAttribute != "Physical"){
            MinimumCriticalIncrease += 10;
            MaximumCriticalIncrease += 10;
          }

          if(!!Settings.DailyAttack.Boss[CurrentBoss].Debuffs.IncreaseCriticalDamage[UserID] == true){
            for(let i = 0; i < Settings.DailyAttack.Boss[CurrentBoss].Debuffs.IncreaseCriticalDamage[UserID].length; i++){
              MinimumCriticalIncrease += Settings.DailyAttack.Boss[CurrentBoss].Debuffs.IncreaseCriticalDamage[UserID][i].Amount * 100;
              MaximumCriticalIncrease += Settings.DailyAttack.Boss[CurrentBoss].Debuffs.IncreaseCriticalDamage[UserID][i].Amount * 100;
              console.log("After debuff MinimumCriticalIncrease (Stack #" + i + "): " + MinimumCriticalIncrease);
              console.log("After debuff MaximumCriticalIncrease (Stack #" + i + "): " + MaximumCriticalIncrease);
            }
          }

          Damage *= 1 + 0.01 * getRandom(MinimumCriticalIncrease, MaximumCriticalIncrease);

          MessageInfo += "Critical hit!\n";
        }
        console.log("Critical hit: " + Damage);

        if(Settings.DailyAttack.Boss[CurrentBoss].Attribute == Settings.DailyAttack.Attributes[CharactersDB[CurrentlyUsingCharacter].Attribute].Weak || (Settings.DailyAttack.Boss[CurrentBoss].Attribute == "Daily" && Settings.DailyAttack.Boss[CurrentBoss].Daily.Attribute[DateV.getUTCDay()] == Settings.DailyAttack.Attributes[CharactersDB[CurrentlyUsingCharacter].Attribute].Weak)){
          // Weak against boss attribute
          Damage *= 1 -  0.01 * getRandom(1, 75);
          MessageInfo += "Not effective attribute!\n";
        }
        console.log("Not effective attribute: " + Damage);

        if(Settings.DailyAttack.Boss[CurrentBoss].ResistantTo == CharactersDB[CurrentlyUsingCharacter].AttackType || (Settings.DailyAttack.Boss[CurrentBoss].ResistantTo == "Daily" && Settings.DailyAttack.Boss[CurrentBoss].Daily.ResistantTo[DateV.getUTCDay()] == CharactersDB[CurrentlyUsingCharacter].AttackType)){
          // Weak type attack
          Damage *= 1 -  0.01 * getRandom(1, 50);
          MessageInfo += "Weak attack type!\n";
        }
        console.log("Weak attack type: " + Damage);
        
        // DEBUFFS

        if(Settings.DailyAttack.Boss[CurrentBoss].Debuffs.DefenseDown > 0){
          // Extra damage, oof.
          Damage *= 1 + Settings.DailyAttack.Boss[CurrentBoss].Debuffs.DefenseDown;
          MessageInfo += "Extra damage thanks to Unicorn's Support!\n";
        }
        console.log("Extra damage thanks to Unicorn's Support: : " + Damage);

        if(Settings.DailyAttack.Boss[CurrentBoss].Debuffs.AttackTypeDefenseDown == CharactersDB[CurrentlyUsingCharacter].AttackType && Settings.DailyAttack.Boss[CurrentBoss].Debuffs.AttackTypeDefenseDownValue > 0){
          // Extra damage, oof.
          Damage *= 1 + Settings.DailyAttack.Boss[CurrentBoss].Debuffs.AttackTypeDefenseDownValue;
          MessageInfo += "Extra damage on Attack Type thanks to Unicorn's Support!\n";
        }
        console.log("Extra damage on Attack Type thanks to Unicorn's Support: " + Damage);

        if(Settings.DailyAttack.Boss[CurrentBoss].Debuffs.DebuffedAttribute == CharactersDB[CurrentlyUsingCharacter].Attribute && Settings.DailyAttack.Boss[CurrentBoss].Debuffs.DebuffedAttributeValue > 0){
          // Extra damage, oof.
          Damage *= 1 + Settings.DailyAttack.Boss[CurrentBoss].Debuffs.DebuffedAttributeValue;
          MessageInfo += "Extra damage thanks to debuff on attribute!\n";
        }
        console.log("Extra damage thanks to debuff on attribute: " + Damage);

         if(Settings.DailyAttack.Boss[CurrentBoss].Debuffs.DebuffedAttackType == CharactersDB[CurrentlyUsingCharacter].AttackType && Settings.DailyAttack.Boss[CurrentBoss].Debuffs.DebuffedAttackTypeValue > 0){
          // Extra damage, oof.
          Damage *= 1 + Settings.DailyAttack.Boss[CurrentBoss].Debuffs.DebuffedAttackTypeValue;
          MessageInfo += "Extra damage thanks to debuff on attack type!\n";
        }
         console.log("Extra damage thanks to debuff on attack type: " + Damage);


         CharactersDB[CurrentlyUsingCharacter] = prepareSkills(CharactersDB[CurrentlyUsingCharacter], CharacterLevel);

         if(RefusedToAttack){
          Damage = 0;
          RefusedToSkill = true;
         }

         
         if(!RefusedToSkill){

            if(CharactersDB[CurrentlyUsingCharacter].Skill.Name == "Death"){
              let Chance = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[0];
              if(DateV.getUTCDay() == 2 || DateV.getUTCDay() == 5){
                Chance += 10; // TEMPORARY PLEASE REMOVE LATER KTHX
              }
              // OH GOD OH GOD
              let RandomChance = getRandom(0, 100);
              if(RandomChance <= Chance){
                message.channel.send("Listen. The evening bell has tolled thy name. The feathers foreshadow your death, and behead, **Azrael!**");
                Damage *= 1 + 0.01 * getRandom(0, 500);
              }
            }
            console.log("Death: " + Damage);

            if(CharactersDB[CurrentlyUsingCharacter].Skill.Name == "Ballistics"){
              let Value = [];
              let Chance = [];
              let RandomChance = [];
              Value[0] = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[0];
              Chance[0] = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[1];
              Value[1] = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[2];
              Chance[1] = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[3];
              Value[2] = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[4];
              Chance[2] = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[5];
              Value[3] = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[6];
              Chance[3] = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[7];
              Value[4] = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[8];
              Chance[4] = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[9];
              RandomChance[0] = getRandom(0, 100);
              RandomChance[1] = getRandom(0, 100);
              RandomChance[2] = getRandom(0, 100);
              RandomChance[3] = getRandom(0, 100);
              RandomChance[4] = getRandom(0, 100);
              let i = 0;
              let MessageToAppend = "";

              if(DateV.getUTCDay() == 6){
                Chance[0] += 10; // TEMPORARY PLEASE REMOVE LATER KTHX
                Chance[1] += 10;
                Chance[2] += 10;
                Chance[3] += 10;
                Chance[4] += 10;
              }


              while(i < 5){
                if(RandomChance[i] < Chance[i]){
                  MessageToAppend += "Ballistic hit! Increased damage by " + Value[i] + "x\n";
                  Damage *= Value[i];
                  console.log("Ballistic hit! Increased damage by " + Value[i] + "x\n");
                }
                i++;
              }
              if(MessageToAppend != ""){
                message.channel.send(MessageToAppend);
              }
            }
            //console.log("Ballistics: " + Damage);

         }





        Damage = Math.round(Damage);

        MessageInfo += "You managed to deal " + Damage + " damage to this boss!";
        message.channel.send(MessageInfo);
        //console.log("Sent message");
        if(!!Settings.DailyAttack.Boss[CurrentBoss].DamageDealtBy[UserID] == false){
          Settings.DailyAttack.Boss[CurrentBoss].DamageDealtBy[UserID] = 0;
        }
        Settings.DailyAttack.Boss[CurrentBoss].DamageDealtBy[UserID] += Damage;
        //console.log(Object.keys(Settings.DailyAttack.Boss[CurrentBoss].Debuffs.ContributionTo));
        let AnnouncementChannels = ["399997878128345098", "788926563936108624", "788977228842926111"];
        // let AnnouncementChannels = ["400031804381331466"];
        let UnicornContributed = 0;
        for(let i = 0; i < Object.keys(Settings.DailyAttack.Boss[CurrentBoss].Debuffs.ContributionTo).length; i++){
          let id = Object.keys(Settings.DailyAttack.Boss[CurrentBoss].Debuffs.ContributionTo)[i];
          console.log("ID: " + id);
          UnicornContributed = parseFloat((Damage * Settings.DailyAttack.Boss[CurrentBoss].Debuffs.ContributionTo[id].Amount).toFixed(2));
          Settings.DailyAttack.Boss[CurrentBoss].DamageDealtBy[id] += UnicornContributed;
          
        }
        if(UnicornContributed != 0){
          for(let i = 0; i < AnnouncementChannels.length; i++){
            this.client.channels.get(AnnouncementChannels[i]).send("Unicorn has contributed with " + UnicornContributed + " damage!");
          } 
        }

        Settings.DailyAttack.Boss[CurrentBoss].HP -= Damage;
        if(Settings.DailyAttack.Boss[CurrentBoss].HP <= 0){
          message.channel.send("This boss has been defeated!");
        }

        MasterUser[UserID].DailyAttack.RemainingStamina -= Math.round(RequiredStamina * StaminaSpentDueToMorale);

        if(!RefusedToSkill){
          if(CharactersDB[CurrentlyUsingCharacter].Skill.Name == "ChargeStamina"){
            let RestoredStamina = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[0];
            let Chance = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[1];
            let RandomChance = getRandom(0, 100);
            if(DateV.getUTCDay() == 2 || DateV.getUTCDay() == 5){
              Chance += 10; // TEMPORARY PLEASE REMOVE LATER KTHX
            }
            if(RandomChance <= Chance){
              message.channel.send("Recovered stamina by " + RestoredStamina + "%!");
              MasterUser[UserID].DailyAttack.RemainingStamina += RestoredStamina;
            }  
          } else if(CharactersDB[CurrentlyUsingCharacter].Skill.Name == "Unicorn's Support"){
           let ReducedDefenseAmount = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[0];
           let Chance = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[1];
           let AcquiredDamageContribution = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[2];
           let AttackTypeSupport = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[3];
           let AttackTypeSupportDamage = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[4];
           let TurnsAmount = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[5];
           if(DateV.getUTCDay() == 2 || DateV.getUTCDay() == 5){
            Chance += 10; // TEMPORARY PLEASE REMOVE LATER KTHX
           }
            let RandomChance = getRandom(0, 100);
            if(RandomChance <= Chance){
              message.channel.send("Reduced boss defense by " + ReducedDefenseAmount*100 + "% for 3 turns! Applied " + AttackTypeSupportDamage*100 + "% extra damage for " + AttackTypeSupport + ", you'll also get " + AcquiredDamageContribution*100 + "% of damage contribution while it lasts.");
              Settings.DailyAttack.Boss[CurrentBoss].Debuffs.DefenseDown = ReducedDefenseAmount;
              Settings.DailyAttack.Boss[CurrentBoss].Debuffs.AttackTypeDefenseDown = AttackTypeSupport;
              Settings.DailyAttack.Boss[CurrentBoss].Debuffs.AttackTypeDefenseDownValue = AttackTypeSupportDamage;
              Settings.DailyAttack.Boss[CurrentBoss].Debuffs.DebuffsTurnsLeft = TurnsAmount;
              if(!!Settings.DailyAttack.Boss[CurrentBoss].Debuffs.ContributionTo[UserID] == false){
                let newContribution = {};
                newContribution.Amount = AcquiredDamageContribution;
                newContribution.TurnsLeft = TurnsAmount;
                Settings.DailyAttack.Boss[CurrentBoss].Debuffs.ContributionTo[UserID] = newContribution;
              } else{
                Settings.DailyAttack.Boss[CurrentBoss].Debuffs.ContributionTo[UserID].TurnsLeft += TurnsAmount;
              }
            }
          } else if(CharactersDB[CurrentlyUsingCharacter].Skill.Name == "ApplyDebuff"){
             let DebuffedAttribute = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[0];
             let DebuffedAttributeValue = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[1];
             let DebuffedAttackType = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[2];
             let DebuffedAttackTypeValue = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[3];
             let TurnsAmount = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[4];
             let Chance = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[5];
             if(DateV.getUTCDay() == 2 || DateV.getUTCDay() == 5){
              Chance += 10; // TEMPORARY PLEASE REMOVE LATER KTHX
             }
             let RandomChance = getRandom(0, 100);
             if(RandomChance <= Chance){
              message.channel.send(DebuffedAttributeValue*100 + "% extra damage for " + DebuffedAttribute + " attribute! " + DebuffedAttackTypeValue*100 + "% extra damage for " + DebuffedAttackType + " attacks! (" + TurnsAmount + " turns)");
              Settings.DailyAttack.Boss[CurrentBoss].Debuffs.DebuffedAttribute = DebuffedAttribute;
              Settings.DailyAttack.Boss[CurrentBoss].Debuffs.DebuffedAttributeValue = DebuffedAttributeValue;
              Settings.DailyAttack.Boss[CurrentBoss].Debuffs.DebuffedAttackType = DebuffedAttackType;
              Settings.DailyAttack.Boss[CurrentBoss].Debuffs.DebuffedAttackTypeValue = DebuffedAttackTypeValue;
              Settings.DailyAttack.Boss[CurrentBoss].Debuffs.DebuffsTurnsLeft = TurnsAmount;
             }
          } else if(CharactersDB[CurrentlyUsingCharacter].Skill.Name == "Ghosting"){
            let Value = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[0];
            let Chance = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[1];
            let RandomChance = getRandom(0, 100);
            if(DateV.getUTCDay() == 6){
              Chance += -10; // TEMPORARY PLEASE REMOVE LATER KTHX
            }
            if(RandomChance <= Chance){
              message.channel.send("Oh no! Hanako-kun looks tired! He probably used double of stamina this time!");
              MasterUser[UserID].DailyAttack.RemainingStamina -= Math.round(RequiredStamina * (Value - 1) * StaminaSpentDueToMorale);
            }
          } else if(CharactersDB[CurrentlyUsingCharacter].Skill.Name == "Increase Crit Damage (+Chance on Attribute)"){
            let ExtraCriticalDamageTurns = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[0];
            let Value = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[1];
            let Chance = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[2];
            let OnAttribute = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[3];
            let ExtraChance = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[4];
            let RandomChance = getRandom(0, 100);
            if(Settings.DailyAttack.Boss[CurrentBoss].Attribute == OnAttribute){
              Chance += ExtraChance;
            }
            if(DateV.getUTCDay() == 2 || DateV.getUTCDay() == 5){
              Chance += 10; // TEMPORARY PLEASE REMOVE LATER KTHX
             }

            if(RandomChance <= Chance){
              let MessageToAppend = "Increased critical damage by " + Value*100 + "% for " + ExtraCriticalDamageTurns + " turns!";
              message.channel.send(MessageToAppend);
              if(!!Settings.DailyAttack.Boss[CurrentBoss].Debuffs.IncreaseCriticalDamage[UserID] == false){
                let newIncreaseCriticalDamage = {};
                newIncreaseCriticalDamage.Amount = Value;
                newIncreaseCriticalDamage.TurnsLeft = ExtraCriticalDamageTurns;
                let arrayForThis = [newIncreaseCriticalDamage];
                Settings.DailyAttack.Boss[CurrentBoss].Debuffs.IncreaseCriticalDamage[UserID] = arrayForThis;
              } else{
                let newIncreaseCriticalDamage = {};
                newIncreaseCriticalDamage.Amount = Value;
                newIncreaseCriticalDamage.TurnsLeft = ExtraCriticalDamageTurns;
                Settings.DailyAttack.Boss[CurrentBoss].Debuffs.IncreaseCriticalDamage[UserID].push(newIncreaseCriticalDamage);
              }
            }
          } else if(CharactersDB[CurrentlyUsingCharacter].Skill.Name == "Ignore Stamina Consumption"){
            let IgnoreTimes = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[0];
            let Chance = CharactersDB[CurrentlyUsingCharacter].Skill.Properties[1];
            let RandomChance = getRandom(0, 100);
            if(DateV.getUTCDay() == 2 || DateV.getUTCDay() == 5){
              Chance += 10; // TEMPORARY PLEASE REMOVE LATER KTHX
             }

            if(RandomChance <= Chance){
              let MessageToAppend = "Obtained Ignore Stamina Consumption buff for " + IgnoreTimes + "turns!";
              message.channel.send(MessageToAppend);
              if(!!Settings.DailyAttack.Boss[CurrentBoss].Debuffs.IgnoreStaminaConsumption[UserID] == false){
                let newIgnoreStaminaConsumption = {};
                newIgnoreStaminaConsumption.TurnsLeft = IgnoreTimes;
                Settings.DailyAttack.Boss[CurrentBoss].Debuffs.IgnoreStaminaConsumption[UserID] = newIgnoreStaminaConsumption;
              } else{
                Settings.DailyAttack.Boss[CurrentBoss].Debuffs.IgnoreStaminaConsumption[UserID].TurnsLeft += IgnoreTimes;
              }
            }
          } else if(CharactersDB[CurrentlyUsingCharacter].Skill.Name == "Angel's Revelation"){
            if(!!MasterUser[UserID].DailyAttack.Buffs == false){
              MasterUser[UserID].DailyAttack.Buffs = {};
            }
            if(!!MasterUser[UserID].DailyAttack.Buffs.AngelsRevelation == false){
              MasterUser[UserID].DailyAttack.Buffs.AngelsRevelation = {
                "Enabled": false,
                "Ready": false,
                "Inspiration": 8
              }
            }


            if(MasterUser[UserID].DailyAttack.Buffs.AngelsRevelation.Enabled){
              if(!MasterUser[UserID].DailyAttack.Buffs.AngelsRevelation.Ready){
                console.log(CurrentlyUsingCharacter);
                MasterUser[UserID].DailyAttack.Buffs.AngelsRevelation.Inspiration--;
                if(MasterUser[UserID].DailyAttack.Buffs.AngelsRevelation.Inspiration == 0){
                  MasterUser[UserID].DailyAttack.Buffs.AngelsRevelation.Inspiration = 8;
                  MasterUser[UserID].DailyAttack.Buffs.AngelsRevelation.Ready = true;
                  message.channel.send("Angel's Revelation is ready to be used!");
                }  
              }
            }
          }
        }
        
      
        // Debuffs Cooldown
        if(Settings.DailyAttack.Boss[CurrentBoss].Debuffs.DebuffsTurnsLeft > -1){
          Settings.DailyAttack.Boss[CurrentBoss].Debuffs.DebuffsTurnsLeft -= 1;
          if(Settings.DailyAttack.Boss[CurrentBoss].Debuffs.DebuffsTurnsLeft == -1){
             Settings.DailyAttack.Boss[CurrentBoss].Debuffs.DefenseDown = 0;
             Settings.DailyAttack.Boss[CurrentBoss].Debuffs.AttackTypeDefenseDownValue = 0;
             Settings.DailyAttack.Boss[CurrentBoss].Debuffs.DebuffedAttributeValue = 0;
             Settings.DailyAttack.Boss[CurrentBoss].Debuffs.DebuffedAttackTypeValue = 0;
          }
        }


        for(let i = 0; i < Object.keys(Settings.DailyAttack.Boss[CurrentBoss].Debuffs.ContributionTo).length; i++){
          let id = Object.keys(Settings.DailyAttack.Boss[CurrentBoss].Debuffs.ContributionTo)[i];
          Settings.DailyAttack.Boss[CurrentBoss].Debuffs.ContributionTo[id].TurnsLeft--;
          if(Settings.DailyAttack.Boss[CurrentBoss].Debuffs.ContributionTo[id].TurnsLeft == -1){
            delete Settings.DailyAttack.Boss[CurrentBoss].Debuffs.ContributionTo[id];
          }
        }


      /* if(!!Settings.DailyAttack.Boss[CurrentBoss].Debuffs.IncreaseCriticalDamage[UserID] == false){
        let newIncreaseCriticalDamage = {};
        newIncreaseCriticalDamage.Amount = 0;
        newIncreaseCriticalDamage.TurnsLeft = 0;
        Settings.DailyAttack.Boss[CurrentBoss].Debuffs.IncreaseCriticalDamage[UserID] = newIncreaseCriticalDamage;
      } */
      if(!!Settings.DailyAttack.Boss[CurrentBoss].Debuffs.IncreaseCriticalDamage[UserID] == true){
        for(let i = 0; i < Settings.DailyAttack.Boss[CurrentBoss].Debuffs.IncreaseCriticalDamage[UserID].length; i++){
          Settings.DailyAttack.Boss[CurrentBoss].Debuffs.IncreaseCriticalDamage[UserID][i].TurnsLeft--;
          if(Settings.DailyAttack.Boss[CurrentBoss].Debuffs.IncreaseCriticalDamage[UserID][i].TurnsLeft < 0){
            Settings.DailyAttack.Boss[CurrentBoss].Debuffs.IncreaseCriticalDamage[UserID].shift();
            console.log("Removed one IncreaseCriticalDamage buff instance");
            i--;
          }
        }
        if(Settings.DailyAttack.Boss[CurrentBoss].Debuffs.IncreaseCriticalDamage[UserID].length == 0){
          delete Settings.DailyAttack.Boss[CurrentBoss].Debuffs.IncreaseCriticalDamage[UserID];
        }
      }

      if(!!Settings.DailyAttack.Boss[CurrentBoss].Debuffs.IgnoreStaminaConsumption[UserID] == true){
        if(Settings.DailyAttack.Boss[CurrentBoss].Debuffs.IgnoreStaminaConsumption[UserID].TurnsLeft < 0){
          delete Settings.DailyAttack.Boss[CurrentBoss].Debuffs.IgnoreStaminaConsumption[UserID];
        }
      }



      // Boss STRIKES BACK

      let BossStrikesBackChance = getRandom(0, 100);
      let Aggresivity = Settings.DailyAttack.Boss[CurrentBoss].Aggresivity;
      if(BossStrikesBackChance <= Aggresivity){
        let UsedAttack = 0; // this should be a random, but this enemy only has one attack.
        if(LastAttackAttribute == "Light" || LastAttackAttribute == "Dark" || LastAttackAttribute == "Obscure"){
          if(LastAttackAttribute != CurrentAttackAttribute){
            let ChanceToAvoid = getRandom(0, 100);
            if(ChanceToAvoid <= 5){
              message.channel.send("Boss attack avoided thanks to combo!");
              UsedAttack = 1; 
            }
          }
        } else if(LastAttackAttribute == "Water" && CurrentAttackAttribute == "Ice"){
          let ChanceToAvoid = getRandom(0, 100);
            if(ChanceToAvoid <= 50){
              message.channel.send("Boss attack avoided thanks to combo!");
              UsedAttack = 1; 
            }
        } else if(LastAttackAttribute == "Ice" && CurrentAttackAttribute == "Water"){
          let ChanceToAvoid = getRandom(0, 100);
            if(ChanceToAvoid <= 25){
              message.channel.send("Boss attack avoided thanks to combo!");
              UsedAttack = 1; 
            }
        }
        if(UsedAttack == 0){
          message.channel.send("The Fifth has insulted your waifu! Your character's morale has been decreased by 3 points!");
          MasterUser[UserID].DailyAttack.Inventory[CurrentlyUsingCharacter].Morale -= 3;
          if(MasterUser[UserID].DailyAttack.Inventory[CurrentlyUsingCharacter].Morale < 0){
            MasterUser[UserID].DailyAttack.Inventory[CurrentlyUsingCharacter].Morale = 0;
          }
        }
      }

      if(MasterUser[UserID].DailyAttack.Inventory[CurrentlyUsingCharacter].Morale < 50){
        if(MasterUser[UserID].DailyAttack.Inventory[CurrentlyUsingCharacter].Morale != 0){
          MasterUser[UserID].DailyAttack.Inventory[CurrentlyUsingCharacter].Morale++;
        }
      } else if(MasterUser[UserID].DailyAttack.Inventory[CurrentlyUsingCharacter].Morale > 50){
        if(MasterUser[UserID].DailyAttack.Inventory[CurrentlyUsingCharacter].Morale != 1000){
          MasterUser[UserID].DailyAttack.Inventory[CurrentlyUsingCharacter].Morale--;
        }
      }

      } else{
        message.channel.send("Not enough stamina to attack!");
        return;
      }
    }

    SaveJSON(MasterUser, "./PetBot/settings/user/master.json");
    SaveJSON(Settings, "./PetBot/settings/master.json");  

    /* let FixedJSON = JSON.stringify(MasterUser, null, "\t");
    fs.writeFileSync("./PetBot/settings/user/master.json",FixedJSON);
    let FixedJSON2 = JSON.stringify(Settings, null, "\t");
    fs.writeFileSync("./PetBot/settings/master.json",FixedJSON2); */
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

function sort_object(obj) {
    return Object.fromEntries(Object.entries(obj).sort(([,a],[,b]) => b-a));
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

function prepareSkills(CurrentlyUsingCharacter, Level){
  if(CurrentlyUsingCharacter.Progression.Skill.Value != 0){
    if(CurrentlyUsingCharacter.Progression.Skill.Type != "Special"){
      if(CurrentlyUsingCharacter.Progression.Skill.Type == "Addition"){
        CurrentlyUsingCharacter.Skill.Properties[CurrentlyUsingCharacter.Progression.Skill.PropertyNumber] += CurrentlyUsingCharacter.Progression.Skill.Value * (Level - 1);
      } else if(CurrentlyUsingCharacter.Progression.Skill.Type == "Multiplier"){
        CurrentlyUsingCharacter.Skill.Properties[CurrentlyUsingCharacter.Progression.Skill.PropertyNumber] *= (1 + CurrentlyUsingCharacter.Progression.Skill.Value * (Level - 1));
      }
    }
  }
  return CurrentlyUsingCharacter;
}