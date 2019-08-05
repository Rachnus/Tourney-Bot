var Team = require('./team.js');

g_Teams = [];

/**
 * Creates a new team
 *
 * @param name          team name
 * @param tier          team tier
 * @return Team
 */
function CreateTeam(name, tier)
{
	return AddTeam(new Team.Team(name, tier));
}

/**
 * Adds an existing team to the global teams list
 *
 * @param team          team object
 * @return Team
 */
function AddTeam(team)
{
	if(TeamExists(team.getName()))
		return null;

	g_Teams.push(team);
	return team;
}

/**
 * Removes a team from the teams list
 * Returns true if a team with the name passed as argument was removed
 *
 * @param team_name      team name
 * @return bool
 */
function RemoveTeam(team_name)
{
	var ret = false;
	for(var i = 0; i < g_Teams.length; i++)
	{
		if(g_Teams[i].getName() === team_name)
		{
			g_Teams[i].disband();
			g_Teams.splice(i, 1);
			ret = true;
		}
	}
	return ret;
}

/**
 * Gets a team from teams list by name
 *
 * @param team_name      team name
 * @return Team
 */
function FindTeam(team_name)
{
	for(var i = 0; i < g_Teams.length; i++)
	{
		if(g_Teams[i].getName() === team_name)
			return g_Teams[i];
	}
	return null;
}

/**
 * Returns true if a team exists
 *
 * @param team_name      team name
 * @return bool
 */
function TeamExists(team_name)
{
	for(var i = 0; i < g_Teams.length; i++)
	{
		if(g_Teams[i].getName() === team_name)
			return true;
	}
	return false;
}


module.exports =
{
	CreateTeam:    CreateTeam,
	AddTeam:       AddTeam,
	RemoveTeam:    RemoveTeam,
	FindTeam:      FindTeam,
	TeamExists:    TeamExists,
	teams:         g_Teams

};
