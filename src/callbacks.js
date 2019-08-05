var Commands = require('./commands.js');

/**
 * Called when the node server is ready
 *
 * @param bot            bot client
 * @return void
 */
function OnBotReady(bot)
{
	console.log(`Logged in as ${bot.user.tag}!`);
}

/**
 * Called when a message is sent in the discord server
 *
 * @param bot            bot client
 * @param msg            message object
 * @return void
 */
function OnClientMessage(bot, msg)
{
	if(!msg.content.startsWith(Commands.COMMAND_PREFIX) || msg.author.bot)
		return;
	
	const args = msg.content.slice(Commands.COMMAND_PREFIX.length).split(' ');
	const command = args.shift().toLowerCase();

	for(var i = 0; i < Commands.commands.length; i++)
	{
		if(command === Commands.commands[i].getName())
		{
			var cmd = Commands.commands[i];
			if(!cmd.call(bot, msg, args))
			{
				return msg.reply(`Invalid arguments.\nUsage: ${cmd.getUsage()}`);
			}
		}
			
	}
	
	console.log(args);
}

module.exports = 
{
	OnBotReady: OnBotReady,
	OnClientMessage: OnClientMessage
};

