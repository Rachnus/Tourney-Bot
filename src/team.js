var Player = require('./player.js');
var Role   = require('./role.js');

/**
 * Team class
 */
class Team
{
	/**
	 * Team
	 *
	 * @param name        name of team
	 * @param tier        team tier
	 */
	constructor(name, tier)
	{
		this.m_szName     = name;
		this.m_Tier       = tier;
		this.m_Owner      = {};

		this.m_Roles      = new Array(Role.ROLES.MAX_ROLES);
		this.m_BannedPID  = [];

		for(var i = 0; i < Role.ROLES.MAX_ROLES; i++)
		{
			this.m_Roles[i] = Player.INVALID_PID;
		}
	}

	/**
	 * Get team name
	 *
	 * @return string
	 */
	getName()
	{
		return this.m_szName;
	}

	/**
	 * Get team tier
	 *
	 * @return string
	 */
	getTier()
	{
		return this.m_Tier;
	}

	/**
	 * Get team owner (player id)
	 *
	 * @return int
	 */
	getOwner()
	{
		return this.m_Owner;
	}


	/**
	 * Set team owner
	 *
	 * @param player_id            player id
	 * @return void
	 */
	setOwner(player_id)
	{
		this.m_Owner = player_id;
		Player.GetGlobalPlayerByPID(player_id).setCurrentTeam(this);
	}

	/**
	 * Find player object in team by player id
	 *
	 * @param player_id            player id
	 * @return Player
	 */
	findPlayer(player_id)
	{
		for(var i = 0; i < this.m_Roles.length; i++)
		{
			if(this.m_Roles[i] == null)
				continue;

			if(this.m_Roles[i] == player_id)
				return i;
		}
		return -1;
	}

	/**
	 * Returns true if player exists in team
	 *
	 * @param player_id            player id
	 * @return bool
	 */
	playerExists(player_id)
	{
		return this.findPlayer(player_id) != -1;
	}

	/**
	 * Returns true if role id is taken
	 *
	 * @param role_id              role id
	 * @return bool
	 */
	isRoleIdTaken(role_id)
	{
		return this.m_Roles[role_id] != -1;
	}

	/**
	 * Returns true if role name is taken
	 *
	 * @param role_name            role name
	 * @return bool
	 */
	isRoleNameTaken(role_name)
	{
		var roleId = Role.RoleNameToRoleId(role_name);
		return this.isRoleIdTaken(roleId);
	}

	/**
	 * Adds a player to the team or switch the role of a player by role id
	 * returns true if valid role id
	 *
	 * @param player_id           player id
	 * @param role_id             role id
	 * @return bool
	 */
	setRoleById(player_id, role_id)
	{
		if(!Role.IsValidRoleId(role_id))
			return false;

		// if the player we're setting the role for already has a role within this team, make sure to reset that role
		var roleId = this.findPlayer(player_id);
		if(roleId != -1)
			this.m_Roles[roleId] = -1;

		Player.GetGlobalPlayerByPID(player_id).setCurrentTeam(this);
		this.m_Roles[role_id] = player_id;
		return true;
	}

	/**
	 * Adds a player to the team or switch the role of a player by role name
	 * returns true if valid role name
	 *
	 * @param player_id           player id
	 * @param role_name           role name
	 * @return bool
	 */
	setRoleByName(player_id, role_name)
	{
		if(!Role.IsValidRoleName(role_name))
			return false;

		var roleId = Role.RoleNameToRoleId(role_name);
		return this.setRoleById(player_id, roleId);
	}

	/**
	 * Gets player object by role id
	 *
	 * @param role_id             role id
	 * @return Player
	 */
	getPlayerByRoleId(role_id)
	{
		return Player.GetGlobalPlayerByPID(this.m_Roles[role_id]);
	}

	/**
	 * Gets player object by role name
	 *
	 * @param role_iname         role name
	 * @return Player
	 */
	getPlayerByRoleName(role_name)
	{
		if(!Role.IsValidRoleName(role_name))
			return false;

		var roleId = Role.RoleNameToRoleId(role_name);
		return this.getPlayerByRoleId(roleId);
	}

	/**
	 * Kicks a player from the team
	 * returns true if a player with the player id was kicked
	 *
	 * @param player_id          player id
	 * @return bool
	 */
	kickPlayer(player_id)
	{
		var ret = false;
		for(var i = 0; i < Role.ROLES.MAX_ROLES; i++)
		{
			if(this.m_Roles[i] == player_id)
			{
				Player.GetGlobalPlayerByPID(player_id).setCurrentTeam(null);
				this.m_Roles[i] = Player.INVALID_PID;
				ret = true;
			}
		}
		return ret;
	}

	/**
	 * Returns if player id is banned
	 *
	 * @param player_id          player id
	 * @return bool
	 */
	isBanned(player_id)
	{
		for(var i = 0; i < this.m_BannedPID.length; i++)
		{
			if(this.m_BannedPID[i] == player_id)
				return true;
		}
		return false;
	}

	/**
	 * Bans a player from the team
	 * returns true if a player with the player id was banned
	 *
	 * @param player_id          player id
	 * @return bool
	 */
	banPlayer(player_id)
	{
		if(this.isBanned(player_id))
			return false;

		// First kick the player
		this.kickPlayer(player_id);
		this.m_BannedPID.push(player_id);
		return true;
	}

	/**
	 * Unbans a player from the team
	 * returns true if a player with the player id was unbanned
	 *
	 * @param player_id          player id
	 * @return bool
	 */
	unbanPlayer(player_id)
	{
		for(var i = 0; i < this.m_BannedPID.length; i++)
		{
			if(this.m_BannedPID[i] == player_id)
			{
				this.m_BannedPID.splice(i, 1);
				return true;
			}
		}

		return false;
	}

	/**
	 * Kicks all the players and disbands the team
	 *
	 * @return void
	 */
	disband()
	{
		for(var i = 0; i < Role.ROLES.MAX_ROLES; i++)
		{
			if(this.m_Roles[i] != -1)
			{
				Player.GetGlobalPlayerByPID(this.m_Roles[i]).setCurrentTeam(null);
				this.m_Roles[i] = Player.INVALID_PID;
			}
		}
	}

	/**
	 * Gets the amount of players on the team
	 *
	 * @return int
	 */
	getPlayerCount()
	{
		var x = 0;
		for(var i = 0; i < this.m_Roles.length; i++)
		{
			if(this.m_Roles[i] != -1)
				x++;
		}
		return x;
	}
}

module.exports =
{
	Team
};
