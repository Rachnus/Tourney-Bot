const Token = require('../token.js');

const Discord = require('discord.js');
const bot = new Discord.Client();

var callbacks = require('./callbacks.js');

bot.on('ready', () => 
{
	callbacks.OnBotReady(bot);
});
 
 
bot.on('message', msg => 
{
	callbacks.OnClientMessage(bot, msg);
})

bot.login(Token.TOKEN);