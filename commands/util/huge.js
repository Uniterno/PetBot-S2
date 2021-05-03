const { Command } = require('discord.js-commando');
const Discord = require('discord.js');
var https = require('https');
const fs = require('fs');
// vars that I need for some reason


module.exports = class PetCoinsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'huge',
            group: 'util',
            guildOnly: true,
            memberName: 'huge',
            aliases: ['h'],
            description: 'Makes an emoji huge.',
            throttling: {
        usages: 5,
        duration: 1
    },
        });
    }

   run(message, args) {

        let UserID = message.author.id;


        let patt = new RegExp("[0-9]{17,18}");
        let emoji = patt.exec(message.content);


        console.log(message.content);
        console.log(patt);
        console.log("Emoji: " + emoji);
        message.channel.send({files: ["https://cdn.discordapp.com/emojis/"+emoji+".png"]});
        return;

        if(!!emoji == true){
        	let gifSize = 0;
        /* let remote_url = "https://cdn.discordapp.com/emojis/"+emoji+".gif";
        let path       = './hugetmp/huge.gif';
        let media      = request(remote_url).pipe(fs.createWriteStream(path));
        media.on("finish", () => {
          gifSize = fs.statSync(path).size;
          console.log(fs.statSync(path));
        }); */
          let type = "gif";
          if(gifSize == 0){
            type = "png";
          }
          let hugedImage = new Discord.MessageAttachment("https://cdn.discordapp.com/emojis/"+emoji+"."+type);
          try{
           message.channel.send(hugedImage)
           .catch(error => message.channel.send(error));
         } catch(err){
          message.channel.send(err); 
         }
        } else{
          message.channel.send("An emote couldn't be found.");
        }

    }
  }