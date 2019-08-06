var Team = require('./team.js');

g_Teams = new Map();

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

	g_Teams.set(team.getName(), team);
	return team;
}

/**
 * Removes a team from the teams map
 * Returns true if a team with the name passed as argument was removed
 *
 * @param team_name      team name
 * @return bool
 */
function RemoveTeam(team_name)
{
	return g_Teams.delete(team_name);
}

/**
 * Gets a team from teams map by name
 *
 * @param team_name      team name
 * @return Team
 */
function FindTeam(team_name)
{
	return g_Teams.get(team_name);
}

/**
 * Returns true if a team exists
 *
 * @param team_name      team name
 * @return bool
 */
function TeamExists(team_name)
{
	return g_Teams.has(team_name);
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
