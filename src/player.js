g_Players = [];

const INVALID_PID = -1;

/**
 * Player class
 */
class Player
{
	/**
	 * Player
	 *
	 * @param user        discord user
	 */
	constructor(user)
	{
		this.m_User = user;
		this.m_CurrentTeam = null;
		this.m_PlayerID = -1;
	}

	/**
	 * Get discord user object
	 *
	 * @return Discord.User
	 */
	getDiscordUser()
	{
		return this.m_User;
	}

	/**
	 * Get players current team
	 *
	 * @return Team
	 */
	getCurrentTeam()
	{
		return this.m_CurrentTeam;
	}

	/**
	 * Set players current team
	 *
	 * @param team         new team object
	 * @return void
	 */
	setCurrentTeam(team)
	{
		this.m_CurrentTeam = team;
	}

	/**
	 * Get players id
	 *
	 * @return int
	 */
	getPID()
	{
		return this.m_PlayerID;
	}

	/**
	 * Set players current team
	 *
	 * @param player_id    player id
	 * @return void
	 */
	setPID(player_id)
	{
		this.m_PlayerID = player_id;
	}
}

/**
 * Get player object by discord user
 *
 * @param discord_user     discord user object
 * @return Player
 */
function GetGlobalPlayerByUser(discord_user)
{
	var index = FindPlayerByDiscordUser(discord_user);

	// Global player does not exist, add new
	if(index == -1)
	{
		var player = new Player(discord_user);
		player.setPID(g_Players.length);

		g_Players.push(player);
		return g_Players[g_Players.length - 1];
	}

	// Return existing player
	return g_Players[index];
}

/**
 * Get player object by discord name
 *
 * @param discord_name      discord name
 * @return Player
 */
function GetGlobalPlayerByName(discord_name)
{
	var index = FindPlayerByDiscordName(discord_name);

	// Global player does not exist
	if(index == -1)
		return null;

	// Return existing player
	return g_Players[index];
}

/**
 * Get player object by player id
 *
 * @param player id         player id
 * @return Player
 */
function GetGlobalPlayerByPID(player_id)
{
	return g_Players[player_id];
}

/**
 * Get player id by discord user
 *
 * @param discord_user      discord user object
 * @return int
 */
function FindPlayerByDiscordUser(discord_user)
{
	for(var i = 0; i < g_Players.length; i++)
	{
		if(g_Players[i].getDiscordUser().id == discord_user.id)
			return i;
	}
	return -1;
}

/**
 * Get player id by discord name
 *
 * @param discord_name      discord name
 * @return int
 */
function FindPlayerByDiscordName(discord_name)
{
	for(var i = 0; i < g_Players.length; i++)
	{
		if(g_Players[i].getDiscordUser().username == discord_name)
			return i;
	}
	return -1;
}

module.exports =
{
	INVALID_PID:             INVALID_PID,

	players:                 g_Players,
	Player,

	GetGlobalPlayerByUser:   GetGlobalPlayerByUser,
	GetGlobalPlayerByPID:    GetGlobalPlayerByPID,
	GetGlobalPlayerByName:   GetGlobalPlayerByName,
	FindPlayerByDiscordUser: FindPlayerByDiscordUser,
	FindPlayerByDiscordName: FindPlayerByDiscordName
};
