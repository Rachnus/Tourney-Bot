const TeamsHandler = require('./teamshandler.js');
const Player       = require('./player.js');
const Tiers        = require('./tiers.js');
const Team         = require('./team.js');
const Role         = require('./role.js');

const COMMAND_PREFIX = '!'

/**
 * Command class
 */
class Command
{
	/**
	 * Command
	 *
	 * @param name            name of command
	 * @param callback        callback function for this command
	 * @param argc            amount of arguments required
	 * @param usage           usage string
	 * @param desc            description of this command
	 */
	constructor(name, callback, argc, usage, desc)
	{
		this.m_szName = name;
		this.m_fCallback = callback;
		this.m_iArgCount = argc;
		this.m_szUsage = usage;
		this.m_szDescription = desc;
	}

	call(bot, msg, args)
	{
		if(args.length < this.m_iArgCount)
			return false;

		this.m_fCallback(bot, msg, this, args);
		return true;
	}

	getName()
	{
		return this.m_szName;
	}

	getUsage()
	{
		return this.m_szUsage;
	}

	getDescription()
	{
		return this.m_szDescription;
	}

	getArgCount()
	{
		return this.m_iArgCount;
	}
}

// List of all commands Command name - Callback, Arg Count, Usage string, Description
const g_Commands = [new Command('gm-help',     CmdHelp,               0, `${COMMAND_PREFIX}gm-help`,                                                   'Show command list'),
                    new Command('gm-create',   CmdCreateTeam,         3, `${COMMAND_PREFIX}gm-create <team-name> <rank-tier(iron-challenger)> <role>`, 'Create a new team'),
                    new Command('gm-join',     CmdJoinTeam,           2, `${COMMAND_PREFIX}gm-join <team-name> <role>`,                                'Join an existing team (top, jungle, mid, adc, support)'),
                    new Command('gm-list',     CmdTeamList,           0, `${COMMAND_PREFIX}gm-list`,                                                   'Show all current teams'),
                    new Command('gm-leave',    CmdLeaveTeam,          0, `${COMMAND_PREFIX}gm-leave`,                                                  'Leave existing team'),
                    new Command('gm-transfer', CmdTransferOwnership,  1, `${COMMAND_PREFIX}gm-transfer <player>`,                                      'Transfer ownership to another player within the same team'),
                    new Command('gm-team',     CmdTeamInfo,           0, `${COMMAND_PREFIX}gm-team <team-name(optional)>`,                             'Check what players are in a team and their roles'),
                    new Command('gm-kick',     CmdKickPlayer,         1, `${COMMAND_PREFIX}gm-kick <player>`,                                          'Kick player from team'),
                    new Command('gm-ban',      CmdBanPlayer,          1, `${COMMAND_PREFIX}gm-ban <player>`,                                           'Ban player from team'),
                    new Command('gm-unban',    CmdUnbanPlayer,        1, `${COMMAND_PREFIX}gm-unban <player>`,                                         'Unban player from team')]

/**
 * gm-help command callback
 *
 * @param bot            bot client
 * @param msg            message object
 * @param command        command name
 * @param args           array of arguments
 * @return void
 */
function CmdHelp(bot, msg, command, args)
{
	var helpString = "\nCommands:```\n"
	for(var i = 0; i < g_Commands.length; i++)
	{
		cmd = g_Commands[i];
		helpString += cmd.getUsage() + ' - ' + cmd.getDescription() + `\n`;
	}
	helpString += "```";

	msg.channel.send(`${msg.author}\n${helpString}`);
	return true;
}

/**
 * gm-create command callback
 *
 * @param bot            bot client
 * @param msg            message object
 * @param command        command name
 * @param args           array of arguments
 * @return void
 */
function CmdCreateTeam(bot, msg, command, args)
{
	var teamName = args[0];
	var teamTier = args[1];
	var teamRole = args[2];

	var player = Player.GetGlobalPlayerByUser(msg.author);
	var currentTeam = player.getCurrentTeam();
	if(currentTeam != null)
	{
		msg.channel.send(`${msg.author}\nLeave your current team '${currentTeam.getName()}' before creating another (!gm-leave)`);
		return false;
	}

	if(!Tiers.IsValidTier(teamTier))
	{
		msg.channel.send(`${msg.author}\nInvalid tier '${teamTier.toUpperCase()}'`);
		return false;
	}

	if(!Role.IsValidRoleName(teamRole))
	{
		msg.channel.send(`${msg.author}\nInvalid role '${teamRole.toUpperCase()}'`);
		return false;
	}

	var team = null;
	if((team = TeamsHandler.CreateTeam(teamName, teamTier)))
	{
		team.setOwner(player.getPID());
		team.setRoleByName(player.getPID(), teamRole);
		msg.channel.send(`${msg.author}\nCreated '${teamTier.toUpperCase()}' team '${teamName}'`);
		return true;
	}
	else
	{
		msg.channel.send(`${msg.author}\nTeam '${teamName}' already exists!`);
		return false;
	}
	return true;
}

/**
 * gm-join command callback
 *
 * @param bot            bot client
 * @param msg            message object
 * @param command        command name
 * @param args           array of arguments
 * @return void
 */
function CmdJoinTeam(bot, msg, command, args)
{
	var teamName = args[0];
	var teamRole = args[1];

	if(!Role.IsValidRoleName(teamRole))
	{
		msg.channel.send(`${msg.author}\nInvalid role '${teamRole.toUpperCase()}'`);
		return false;
	}

	var team = TeamsHandler.FindTeam(teamName);
	if(team == null)
	{
		msg.channel.send(`${msg.author}\nTeam '${teamName}' does not exist!`);
		return false;
	}

	var player = Player.GetGlobalPlayerByUser(msg.author);

	if(team.isBanned(player.getPID()))
	{
		msg.channel.send(`${msg.author}\nYou're banned from '${teamName}'`);
		return false;
	}

	if(team.playerExists(player.getPID()))
	{
		var playerRole = team.findPlayer(msg.author);
		if(playerRole == Role.RoleNameToRoleId(teamRole))
		{
			msg.channel.send(`${msg.author}\nYou're already in this team as '${teamRole.toUpperCase()}'`);
			return false;
		}
		else
		{
			if(team.isRoleNameTaken(teamRole))
			{
				msg.channel.send(`${msg.author}\n'${teamRole.toUpperCase()}' is already taken by '${team.getPlayerByRoleName(teamRole).getDiscordUser().username}'`);
				return false;
			}

			team.setRoleByName(player.getPID(), teamRole);
			msg.channel.send(`${msg.author}\nSwitched your role to '${teamRole.toUpperCase()}'`);
			return true;
		}
	}

	if(team.isRoleNameTaken(teamRole))
	{
		msg.channel.send(`${msg.author}\n'${teamRole.toUpperCase()}' is already taken by '${team.getPlayerByRoleName(teamRole).getDiscordUser().username}'`);
		return false;
	}

	team.setRoleByName(player.getPID(), teamRole);
	msg.channel.send(`${msg.author}\nJoined team '${teamName}' as '${teamRole.toUpperCase()}'`);
	return true;
}

/**
 * gm-list command callback
 *
 * @param bot            bot client
 * @param msg            message object
 * @param command        command name
 * @param args           array of arguments
 * @return void
 */
function CmdTeamList(bot, msg, command, args)
{
	if(TeamsHandler.teams.length <= 0)
	{
		msg.channel.send(`${msg.author}\nThere are no teams`);
		return false;
	}
	var teamlistString = "\n(Player Count) Team Name - Rank - Owner:```\n"
	for(var i = 0; i < TeamsHandler.teams.length; i++)
	{
		teamlistString += '(' + TeamsHandler.teams[i].getPlayerCount() + '/' + Role.ROLES.MAX_ROLES + ') ' +
		                  TeamsHandler.teams[i].getName() +
		                  ' - ' +
						  TeamsHandler.teams[i].getTier().toUpperCase() +
						  ' - ' +
						  Player.GetGlobalPlayerByPID(TeamsHandler.teams[i].getOwner()).getDiscordUser().username +
						  `\n`;
	}
	teamlistString += "```";

	msg.channel.send(`${msg.author}\n${teamlistString}`);
	return true;
}

/**
 * gm-leave command callback
 *
 * @param bot            bot client
 * @param msg            message object
 * @param command        command name
 * @param args           array of arguments
 * @return void
 */
function CmdLeaveTeam(bot, msg, command, args)
{
	var player = Player.GetGlobalPlayerByUser(msg.author);
	var currentTeam = player.getCurrentTeam();
	if(currentTeam == null)
	{
		msg.channel.send(`${msg.author}\nYou do not belong to any team`);
		return false;
	}

	var teamName = currentTeam.getName();
	if(player.getPID() == currentTeam.getOwner())
	{
		if(TeamsHandler.RemoveTeam(teamName))
		{
			msg.channel.send(`${msg.author}\nTeam '${teamName}' disbanded`);
			return true;
		}
	}
	else
	{
		if(currentTeam.kickPlayer(player.getPID()))
		{
			msg.channel.send(`${msg.author}\nYou have left team '${teamName}'`);
			return true;
		}
	}

	return false;
}

/**
 * gm-transfer command callback
 *
 * @param bot            bot client
 * @param msg            message object
 * @param command        command name
 * @param args           array of arguments
 * @return void
 */
function CmdTransferOwnership(bot, msg, command, args)
{
	var targetName = args[0];

	var playerOwner = Player.GetGlobalPlayerByUser(msg.author);
	var playerTarget = Player.GetGlobalPlayerByName(targetName);

	var currentTeam = playerOwner.getCurrentTeam();

	if(currentTeam == null)
	{
		msg.channel.send(`${msg.author}\nYou do not belong to a team`);
		return false;
	}

	var teamName = currentTeam.getName();
	if(playerOwner.getPID() != currentTeam.getOwner())
	{
		msg.channel.send(`${msg.author}\nYou are not the owner of your team`);
		return false;
	}

	if(playerTarget == null)
	{
		msg.channel.send(`${msg.author}\nPlayer '${targetName}' does not exist on your team`);
		return false;
	}

	var targetTeam = playerTarget.getCurrentTeam();
	if(targetTeam == null || targetTeam.getName() != currentTeam.getName())
	{
		msg.channel.send(`${msg.author}\nPlayer '${targetName}' does not exist on your team`);
		return false;
	}

	if(playerTarget.getPID() == playerOwner.getPID())
	{
		msg.channel.send(`${msg.author}\nCannot transfer ownership to yourself`);
		return false;
	}

	msg.channel.send(`${msg.author}\nOwnership of team '${teamName}' was transfered to ${playerTarget.getDiscordUser()}`)
	currentTeam.setOwner(playerTarget.getPID());
	return true;
}

/**
 * gm-team command callback
 *
 * @param bot            bot client
 * @param msg            message object
 * @param command        command name
 * @param args           array of arguments
 * @return void
 */
function CmdTeamInfo(bot, msg, command, args)
{
	var playerAuthor = Player.GetGlobalPlayerByUser(msg.author);
	var currentTeam = playerAuthor.getCurrentTeam();

	var teamName = {};
	if(args.length > 1)
	{
		teamName = args[0];
		if((currentTeam = TeamsHandler.FindTeam(teamName)) == null)
		{
			msg.channel.send(`${msg.author}\nThere's no team '${teamName}'`);
			return false;
		}
	}
	else
	{
		if(currentTeam == null)
		{
			msg.channel.send(`${msg.author}\nYou do not belong to any team`);
			return false;
		}

		teamName = currentTeam.getName();
	}

	var teamOwner = Player.GetGlobalPlayerByPID(currentTeam.getOwner());
	var output = `\nTeam: ${teamName}\nTier: ${currentTeam.getTier().toUpperCase()}\nPlayers: ${currentTeam.getPlayerCount()}/${Role.ROLES.MAX_ROLES}\nOwner: ${teamOwner.getDiscordUser().username}\n\nRole - Name:\`\`\`\n`
	for(var i = 0; i < Role.ROLES.MAX_ROLES; i++)
	{
		if(currentTeam.m_Roles[i] != -1)
		{
			var player = Player.GetGlobalPlayerByPID(currentTeam.m_Roles[i]);
			output += Role.RoleIdToRoleName(i).toUpperCase() + ' - ' + player.getDiscordUser().username + '\n';
		}
		else
		{
			output += Role.RoleIdToRoleName(i).toUpperCase() + ' - \n';
		}

	}
	output += "```";

	msg.channel.send(`${msg.author}\n${output}`);

	return true;
}

/**
 * gm-kick command callback
 *
 * @param bot            bot client
 * @param msg            message object
 * @param command        command name
 * @param args           array of arguments
 * @return void
 */
function CmdKickPlayer(bot, msg, command, args)
{
	var targetName = args[0];

	var playerOwner = Player.GetGlobalPlayerByUser(msg.author);
	var playerTarget = Player.GetGlobalPlayerByName(targetName);

	var currentTeam = playerOwner.getCurrentTeam();

	if(currentTeam == null)
	{
		msg.channel.send(`${msg.author}\nYou do not belong to a team`);
		return false;
	}

	var teamName = currentTeam.getName();
	if(playerOwner.getPID() != currentTeam.getOwner())
	{
		msg.channel.send(`${msg.author}\nYou are not the owner of your team`);
		return false;
	}

	if(playerTarget == null)
	{
		msg.channel.send(`${msg.author}\nPlayer '${targetName}' does not exist on your team`);
		return false;
	}

	var targetTeam = playerTarget.getCurrentTeam();
	if(targetTeam == null || targetTeam.getName() != currentTeam.getName())
	{
		msg.channel.send(`${msg.author}\nPlayer '${targetName}' does not exist on your team`);
		return false;
	}

	if(playerTarget.getPID() == playerOwner.getPID())
	{
		msg.channel.send(`${msg.author}\nUse !gm-leave to leave and disband the team`);
		return false;
	}

	msg.channel.send(`${msg.author}\n${playerTarget.getDiscordUser()} was kicked from ${teamName}`)
	currentTeam.kickPlayer(playerTarget.getPID());
	return true;
}

/**
 * gm-ban command callback
 *
 * @param bot            bot client
 * @param msg            message object
 * @param command        command name
 * @param args           array of arguments
 * @return void
 */
function CmdBanPlayer(bot, msg, command, args)
{
	var targetName = args[0];

	var playerOwner = Player.GetGlobalPlayerByUser(msg.author);
	var playerTarget = Player.GetGlobalPlayerByName(targetName);

	var currentTeam = playerOwner.getCurrentTeam();

	if(currentTeam == null)
	{
		msg.channel.send(`${msg.author}\nYou do not belong to a team`);
		return false;
	}

	var teamName = currentTeam.getName();
	if(playerOwner.getPID() != currentTeam.getOwner())
	{
		msg.channel.send(`${msg.author}\nYou are not the owner of your team`);
		return false;
	}

	if(playerTarget == null)
	{
		msg.channel.send(`${msg.author}\nPlayer '${targetName}' does not exist on your team`);
		return false;
	}

	var targetTeam = playerTarget.getCurrentTeam();
	if(targetTeam == null || targetTeam.getName() != currentTeam.getName())
	{
		msg.channel.send(`${msg.author}\nPlayer '${targetName}' does not exist on your team`);
		return false;
	}

	if(playerTarget.getPID() == playerOwner.getPID())
	{
		msg.channel.send(`${msg.author}\nCannot ban yourself`);
		return false;
	}

	msg.channel.send(`${msg.author}\n${playerTarget.getDiscordUser()} was banned from ${teamName}`)
	currentTeam.banPlayer(playerTarget.getPID());
	return true;
}

/**
 * gm-unban command callback
 *
 * @param bot            bot client
 * @param msg            message object
 * @param command        command name
 * @param args           array of arguments
 * @return void
 */
function CmdUnbanPlayer(bot, msg, command, args)
{
	var targetName = args[0];

	var playerOwner = Player.GetGlobalPlayerByUser(msg.author);
	var playerTarget = Player.GetGlobalPlayerByName(targetName);

	var currentTeam = playerOwner.getCurrentTeam();

	if(currentTeam == null)
	{
		msg.channel.send(`${msg.author}\nYou do not belong to a team`);
		return false;
	}

	var teamName = currentTeam.getName();
	if(playerOwner.getPID() != currentTeam.getOwner())
	{
		msg.channel.send(`${msg.author}\nYou are not the owner of your team`);
		return false;
	}

	if(playerTarget == null)
	{
		msg.channel.send(`${msg.author}\nPlayer '${targetName}' is not banned from '${teamName}'`);
		return false;
	}

	if(playerTarget.getPID() == playerOwner.getPID())
	{
		msg.channel.send(`${msg.author}\nCannot unban yourself`);
		return false;
	}

	if(!currentTeam.unbanPlayer(playerTarget.getPID()))
	{
		msg.channel.send(`${msg.author}\nPlayer '${targetName}' is not banned from '${teamName}'`);
		return false;
	}

	msg.channel.send(`${msg.author}\n${playerTarget.getDiscordUser()} was unbanned from ${teamName}`);
	return true;
}

module.exports =
{
	commands:g_Commands,
	COMMAND_PREFIX:COMMAND_PREFIX
};
