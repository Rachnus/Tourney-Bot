g_Players = new Map();

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
	var player = g_Players.get(discord_user.id);

	// Global player does not exist, add new
	if(player == null)
	{
		player = new Player(discord_user);
		player.setPID(discord_user.id);

		g_Players.set(discord_user.id, player);
	}

	// Return existing player
	return player;
}

/**
 * Get player object by player id
 *
 * @param player id         player id
 * @return Player
 */
function GetGlobalPlayerByPID(player_id)
{
	return g_Players.get(player_id);
}

module.exports =
{
	INVALID_PID:             INVALID_PID,

	players:                 g_Players,
	Player,

	GetGlobalPlayerByUser:   GetGlobalPlayerByUser,
	GetGlobalPlayerByPID:    GetGlobalPlayerByPID,
};
